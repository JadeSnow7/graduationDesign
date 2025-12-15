from __future__ import annotations

import os
from typing import Any, Literal

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

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


def _system_prompt(mode: str | None) -> str | None:
    if not mode:
        return None
    mode = mode.strip().lower()
    if mode == "tutor":
        return (
            "你是高校《电磁场》课程助教。"
            "回答要循序渐进，先给结论，再给推导思路与关键公式，必要时给直观类比。"
            "如果问题涉及计算，请说明变量含义与单位；避免编造来源。"
        )
    if mode == "grader":
        return (
            "你是《电磁场》课程助教，任务是辅助批改作业。"
            "请指出关键错误与缺失步骤，给出改进建议与提示。"
            "默认不要直接给出完整最终答案，除非用户明确请求并且具有相应权限（此处按提示模式处理）。"
        )
    if mode == "sim_explain":
        return (
            "你是《电磁场》课程助教，任务是解释仿真结果。"
            "请结合参数与图像趋势解释物理含义，并给出课堂提问建议。"
        )
    return None


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

