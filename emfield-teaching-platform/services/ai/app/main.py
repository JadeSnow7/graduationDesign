from __future__ import annotations

import os
from functools import lru_cache
from typing import Any, Literal

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.graphrag.index import GraphRAGIndex
from app.graphrag.retrieve import build_rag_context

app = FastAPI(title="AI Service", version="0.1.0")


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"] = "user"
    content: str = Field(min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    mode: str | None = None
    messages: list[ChatMessage] = Field(min_length=1)


class ChatResponse(BaseModel):
    reply: str
    model: str | None = None


def _get_env(name: str) -> str:
    v = os.getenv(name, "")
    return v.strip()


def _get_bool_env(name: str, default: bool = False) -> bool:
    v = _get_env(name).lower()
    if v in {"1", "true", "yes", "y", "on"}:
        return True
    if v in {"0", "false", "no", "n", "off"}:
        return False
    return default


def _get_int_env(name: str, default: int) -> int:
    v = _get_env(name)
    if not v:
        return default
    try:
        return int(v)
    except ValueError:
        return default


def _parse_mode(mode: str | None) -> tuple[str | None, bool]:
    if not mode:
        return None, False
    m = mode.strip().lower()
    if m.endswith("_rag"):
        base = m[: -len("_rag")].strip() or None
        return base, True
    return m, False


def _system_prompt(mode: str | None) -> str | None:
    base_mode, _ = _parse_mode(mode)
    if not base_mode:
        return None
    if base_mode == "tutor":
        return (
            "你是高校《电磁场》课程助教。"
            "回答要循序渐进，先给结论，再给推导思路与关键公式，必要时给直观类比。"
            "如果问题涉及计算，请说明变量含义与单位；避免编造来源。"
        )
    if base_mode == "grader":
        return (
            "你是《电磁场》课程助教，任务是辅助批改作业。"
            "请指出关键错误与缺失步骤，给出改进建议与提示。"
            "默认不要直接给出完整最终答案，除非用户明确请求并且具有相应权限（此处按提示模式处理）。"
        )
    if base_mode == "sim_explain":
        return (
            "你是《电磁场》课程助教，任务是解释仿真结果。"
            "请结合参数与图像趋势解释物理含义，并给出课堂提问建议。"
        )
    if base_mode == "formula_verify":
        return (
            "你是《电磁场》课程助教，任务是帮助验证和推导公式。"
            "请按以下步骤处理：\n"
            "1. 首先确认公式是否正确，指出可能的错误\n"
            "2. 给出完整的推导过程，每一步都要说明依据（如麦克斯韦方程、边界条件等）\n"
            "3. 说明公式的适用范围和限制条件\n"
            "4. 如有必要，给出数值计算示例验证公式\n"
            "使用 LaTeX 格式书写公式，如 $\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$"
        )
    if base_mode == "sim_tutor":
        return (
            "你是《电磁场》课程助教，专门负责仿真结果的教学解读。"
            "你的任务是：\n"
            "1. 解释仿真图像中的物理现象，如电场线分布、电势等值线含义\n"
            "2. 将仿真结果与理论公式关联，说明数值解与解析解的对应关系\n"
            "3. 引导学生发现仿真中的关键特征（如边界效应、对称性等）\n"
            "4. 提出思考问题帮助学生深入理解\n"
            "5. 如果用户提供了仿真参数，请分析参数变化对结果的影响\n"
            "回答时要图文结合，引用仿真结果中的具体数据。"
        )
    if base_mode == "problem_solver":
        return (
            "你是《电磁场》课程助教，擅长解决电磁场计算题。"
            "解题步骤：\n"
            "1. 分析问题，明确已知条件和求解目标\n"
            "2. 选择合适的坐标系和求解方法\n"
            "3. 列出相关的基本方程（如泊松方程、拉普拉斯方程、边界条件）\n"
            "4. 进行推导，每步给出详细说明\n"
            "5. 代入数值计算，注意单位换算\n"
            "6. 检验结果的合理性（量纲、极限情况、物理直觉）\n"
            "使用 LaTeX 格式书写公式。"
        )
    return None


@lru_cache(maxsize=4)
def _load_graphrag_index(path: str) -> GraphRAGIndex | None:
    try:
        if not path:
            return None
        return GraphRAGIndex.load(path)
    except Exception:
        return None


def _build_graphrag_system_message(context: str) -> str:
    return (
        "以下是从课程知识库检索到的片段（带编号与来源）。\n"
        "回答要求：\n"
        "1) 优先基于片段作答；如果片段不足以支撑结论，请明确说明“不足以从知识库确定”，并给出需要补充的信息。\n"
        "2) 用 [编号] 标注你依据的片段，例如 [1][3]。\n"
        "3) 不要编造不存在的引用。\n\n"
        f"{context}"
    ).strip()


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    base_url = _get_env("LLM_BASE_URL")
    api_key = _get_env("LLM_API_KEY")
    model = _get_env("LLM_MODEL") or "qwen-plus"

    system = _system_prompt(req.mode)
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.extend([m.model_dump() for m in req.messages])

    _, rag_requested = _parse_mode(req.mode)
    if rag_requested and _get_bool_env("GRAPH_RAG_ENABLED", default=False):
        index_path = _get_env("GRAPH_RAG_INDEX_PATH") or "app/data/graphrag_index.json"
        index = _load_graphrag_index(index_path)
        if index:
            query = ""
            for m in reversed(req.messages):
                if m.role == "user":
                    query = m.content
                    break
            context = build_rag_context(
                index,
                query,
                seed_top_k=_get_int_env("GRAPH_RAG_SEED_TOP_K", default=4),
                expand_hops=_get_int_env("GRAPH_RAG_EXPAND_HOPS", default=1),
                final_top_k=_get_int_env("GRAPH_RAG_FINAL_TOP_K", default=8),
                max_chars=_get_int_env("GRAPH_RAG_MAX_CONTEXT_CHARS", default=4000),
            )
            if context:
                insert_at = 1 if system else 0
                messages.insert(insert_at, {"role": "system", "content": _build_graphrag_system_message(context)})

    if not base_url or not api_key:
        return ChatResponse(
            reply=(
                "AI 服务已启动，但未配置上游大模型。"
                "请设置环境变量 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL 后重试。"
            ),
            model=None,
        )

    url = base_url.rstrip("/") + "/v1/chat/completions"
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
    }
    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, json=payload, headers=headers)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"upstream request failed: {e}") from e

    if resp.status_code >= 300:
        raise HTTPException(status_code=502, detail=f"upstream error: {resp.status_code} {resp.text}")

    data = resp.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"invalid upstream response: {e}") from e

    return ChatResponse(reply=str(content).strip(), model=model)
