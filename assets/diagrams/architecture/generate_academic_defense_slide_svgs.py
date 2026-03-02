#!/usr/bin/env python3
"""Generate academic-defense SVG diagrams for slides 7-10."""

from __future__ import annotations

import html
from pathlib import Path


SLIDE_W = 1920
SLIDE_H = 1080
GRID_GAP = 60
GRID_MARGIN = 30
GRID_W = GRID_MARGIN * 2 + SLIDE_W * 2 + GRID_GAP
GRID_H = GRID_MARGIN * 2 + SLIDE_H * 2 + GRID_GAP

FONT_STACK = "Inter, 'Noto Sans SC', 'SF Pro Text', Roboto, sans-serif"

BG = "#FFFFFF"
PANEL = "#FAFAF7"
INK = "#2B2B2B"
ACCENT = "#2E4A62"
GOLD = "#C19B6C"
RED = "#C53030"
MUTED = "#6B6B6B"
BORDER = "#DED9CF"
LIGHT_BLUE = "#F7FAFC"
LIGHT_GOLD = "#FFFCF6"
LIGHT_RED = "#FFF7F7"
LINE = "#4B4B4B"


def esc(text: str) -> str:
    return html.escape(str(text), quote=True)


def fmt(value: float | int | str) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, int):
        return str(value)
    return f"{value:.2f}".rstrip("0").rstrip(".")


def attrs(**kwargs: object) -> str:
    chunks = []
    for key, value in kwargs.items():
        if value is None:
            continue
        key = key.rstrip("_").replace("_", "-")
        chunks.append(f'{key}="{esc(fmt(value))}"')
    return " ".join(chunks)


def rect(
    x: float,
    y: float,
    w: float,
    h: float,
    *,
    rx: float = 16,
    fill: str = BG,
    stroke: str = BORDER,
    stroke_width: float = 2,
    dash: str | None = None,
    opacity: float | None = None,
    extra: str = "",
) -> str:
    attr_str = attrs(
        x=x,
        y=y,
        width=w,
        height=h,
        rx=rx,
        fill=fill,
        stroke=stroke,
        stroke_width=stroke_width,
        stroke_dasharray=dash,
        opacity=opacity,
    )
    suffix = f" {extra}" if extra else ""
    return f"<rect {attr_str}{suffix}/>"


def circle(
    cx: float,
    cy: float,
    r: float,
    *,
    fill: str = ACCENT,
    stroke: str | None = None,
    stroke_width: float | None = None,
) -> str:
    return (
        f'<circle {attrs(cx=cx, cy=cy, r=r, fill=fill, stroke=stroke, stroke_width=stroke_width)}/>'
    )


def line_path(
    points: list[tuple[float, float]],
    *,
    color: str = LINE,
    width: float = 2.5,
    dashed: bool = False,
    marker_end: str | None = "arrow-dark",
    marker_start: str | None = None,
    opacity: float | None = None,
) -> str:
    dash = "8 6" if dashed else None
    d = "M " + " L ".join(f"{fmt(x)} {fmt(y)}" for x, y in points)
    attr_str = attrs(
        d=d,
        fill="none",
        stroke=color,
        stroke_width=width,
        stroke_linecap="round",
        stroke_linejoin="round",
        stroke_dasharray=dash,
        opacity=opacity,
        marker_end=f"url(#{marker_end})" if marker_end else None,
        marker_start=f"url(#{marker_start})" if marker_start else None,
    )
    return f"<path {attr_str}/>"


def text_block(
    x: float,
    y: float,
    lines: list[str] | tuple[str, ...] | str,
    *,
    size: float = 15,
    fill: str = INK,
    weight: int = 400,
    anchor: str = "start",
    line_height: float | None = None,
    font_style: str = "normal",
    opacity: float | None = None,
    letter_spacing: float | None = None,
) -> str:
    if isinstance(lines, str):
        lines = [lines]
    if line_height is None:
        line_height = size * 1.28
    tspan_parts = []
    for idx, line in enumerate(lines):
        tspan_parts.append(
            f'<tspan {attrs(x=x, y=y + idx * line_height)}>{esc(line)}</tspan>'
        )
    attr_str = attrs(
        font_family=FONT_STACK,
        font_size=size,
        fill=fill,
        font_weight=weight,
        text_anchor=anchor,
        dominant_baseline="hanging",
        font_style=font_style,
        opacity=opacity,
        letter_spacing=letter_spacing,
    )
    return f'<text {attr_str}>{"".join(tspan_parts)}</text>'


def node(
    x: float,
    y: float,
    w: float,
    h: float,
    title_lines: list[str] | tuple[str, ...] | str,
    *,
    subtitle_lines: list[str] | tuple[str, ...] | str | None = None,
    kind: str = "core",
    align: str = "center",
    title_size: float = 15,
    subtitle_size: float = 13,
) -> str:
    if isinstance(title_lines, str):
        title_lines = [title_lines]
    if subtitle_lines is None:
        subtitle_lines = []
    elif isinstance(subtitle_lines, str):
        subtitle_lines = [subtitle_lines]

    styles = {
        "core": dict(fill=BG, stroke=INK, dash=None, stroke_width=2),
        "highlight": dict(fill=LIGHT_BLUE, stroke=ACCENT, dash=None, stroke_width=2),
        "warning": dict(fill=LIGHT_RED, stroke=RED, dash="8 6", stroke_width=2),
        "note": dict(fill=LIGHT_GOLD, stroke=GOLD, dash=None, stroke_width=2),
        "result": dict(fill=LIGHT_BLUE, stroke=ACCENT, dash=None, stroke_width=2.5),
    }
    style = styles[kind]

    title_line_height = title_size * 1.18
    subtitle_line_height = subtitle_size * 1.22
    total_height = len(title_lines) * title_line_height
    if subtitle_lines:
        total_height += 8 + len(subtitle_lines) * subtitle_line_height

    x_text = x + w / 2 if align == "center" else x + 24
    anchor = "middle" if align == "center" else "start"
    y_title = y + (h - total_height) / 2

    parts = [
        rect(
            x,
            y,
            w,
            h,
            rx=16,
            fill=style["fill"],
            stroke=style["stroke"],
            stroke_width=style["stroke_width"],
            dash=style["dash"],
        ),
        text_block(
            x_text,
            y_title,
            list(title_lines),
            size=title_size,
            fill=INK,
            weight=500 if kind != "warning" else 450,
            anchor=anchor,
            line_height=title_line_height,
        ),
    ]
    if subtitle_lines:
        parts.append(
            text_block(
                x_text,
                y_title + len(title_lines) * title_line_height + 8,
                list(subtitle_lines),
                size=subtitle_size,
                fill=MUTED if kind != "highlight" else ACCENT,
                weight=400,
                anchor=anchor,
                line_height=subtitle_line_height,
            )
        )
    return "".join(parts)


def note_box(
    x: float,
    y: float,
    w: float,
    h: float,
    title: str,
    body_lines: list[str] | tuple[str, ...] | str,
    *,
    kind: str = "gold",
) -> str:
    if isinstance(body_lines, str):
        body_lines = [body_lines]
    if kind == "gold":
        fill = LIGHT_GOLD
        stroke = GOLD
        dash = None
        title_fill = GOLD
    else:
        fill = LIGHT_RED
        stroke = RED
        dash = "8 6"
        title_fill = RED

    parts = [
        rect(x, y, w, h, rx=14, fill=fill, stroke=stroke, stroke_width=2, dash=dash),
        text_block(x + 20, y + 18, title, size=14, fill=title_fill, weight=600),
        text_block(
            x + 20,
            y + 46,
            list(body_lines),
            size=13,
            fill=INK,
            weight=400,
            line_height=18,
            font_style="italic" if kind == "gold" else "normal",
        ),
    ]
    return "".join(parts)


def container(
    x: float,
    y: float,
    w: float,
    h: float,
    label: str,
    *,
    accent: str = INK,
) -> str:
    return "".join(
        [
            rect(x, y, w, h, rx=20, fill=PANEL, stroke=BORDER, stroke_width=2, dash="10 8"),
            text_block(x + 26, y + 20, label, size=19, fill=accent, weight=600),
            f'<line {attrs(x1=x + 26, y1=y + 52, x2=x + 170, y2=y + 52, stroke=accent, stroke_width=2)}/>',
        ]
    )


def chip(
    x: float,
    y: float,
    w: float,
    h: float,
    label: str,
    *,
    fill: str = BG,
    stroke: str = BORDER,
    text_fill: str = INK,
    dash: str | None = None,
    weight: int = 500,
) -> str:
    return "".join(
        [
            rect(x, y, w, h, rx=h / 2, fill=fill, stroke=stroke, stroke_width=1.5, dash=dash),
            text_block(x + w / 2, y + h / 2 - 8, label, size=12.5, fill=text_fill, weight=weight, anchor="middle"),
        ]
    )


def frame_shell(slide_no: str, title: str, subtitle: str, body: str) -> str:
    parts = [
        rect(8, 8, SLIDE_W - 16, SLIDE_H - 16, rx=26, fill=BG, stroke=BORDER, stroke_width=2),
        rect(8, 8, SLIDE_W - 16, 16, rx=26, fill=ACCENT, stroke=ACCENT, stroke_width=0),
        chip(1682, 46, 168, 44, f"Slide {slide_no}", fill=ACCENT, stroke=ACCENT, text_fill=BG),
        text_block(72, 56, title, size=27, fill=INK, weight=600),
        text_block(72, 96, subtitle, size=14, fill=MUTED, weight=400),
        f'<line {attrs(x1=72, y1=126, x2=352, y2=126, stroke=GOLD, stroke_width=2.5)}/>',
        body,
    ]
    return f'<g id="slide-{slide_no}">{"".join(parts)}</g>'


def arrow_label(x: float, y: float, w: float, label: str) -> str:
    return chip(x, y, w, 28, label, fill=BG, stroke=BORDER, text_fill=INK, weight=450)


def slide_07() -> str:
    parts: list[str] = []
    parts.append(container(96, 170, 1728, 140, "Layer 1 - Requests"))
    parts.append(container(560, 350, 800, 320, "Layer 2 - Constraint-Aware Router", accent=ACCENT))
    parts.append(container(184, 690, 1552, 170, "Layer 3 - Execution Targets"))
    parts.append(container(160, 874, 1600, 150, "Telemetry & Guardrails", accent=ACCENT))

    parts.append(
        node(
            300,
            214,
            430,
            72,
            "User Query",
            subtitle_lines="QA / Code / Vision",
        )
    )
    parts.append(
        node(
            1190,
            214,
            430,
            72,
            "Task Context",
            subtitle_lines="Coursework / Slides",
        )
    )

    parts.append(
        node(
            760,
            398,
            400,
            72,
            "Feature Extractor",
            subtitle_lines="difficulty / modality / length",
        )
    )
    parts.append(
        node(
            760,
            492,
            400,
            72,
            "Policy Engine",
            subtitle_lines="privacy / latency / compliance",
        )
    )
    parts.append(
        node(
            730,
            586,
            460,
            78,
            "Routing Decision",
            subtitle_lines="Edge / Cloud / Hybrid",
            kind="highlight",
        )
    )
    parts.append(
        note_box(
            1214,
            478,
            410,
            98,
            "Key Claim",
            ["Optimize answer quality", "under privacy & latency constraints."],
        )
    )

    parts.append(
        node(
            280,
            734,
            560,
            74,
            "Edge Stack",
            subtitle_lines="Local LLM / Reranker",
        )
    )
    parts.append(
        node(
            1080,
            734,
            560,
            74,
            "Cloud Stack",
            subtitle_lines="Large LLM / VLM / Coder",
        )
    )
    parts.append(
        node(
            292,
            920,
            900,
            70,
            "Tracing & Metrics",
            subtitle_lines="P95 latency / cost",
        )
    )
    parts.append(
        node(
            1248,
            920,
            430,
            70,
            "Safety Guardrails",
            subtitle_lines="PII redaction",
        )
    )

    parts.append(circle(960, 360, 5, fill=ACCENT))
    parts.append(line_path([(515, 286), (515, 326), (960, 326), (960, 360)]))
    parts.append(line_path([(1405, 286), (1405, 326), (960, 326), (960, 360)]))
    parts.append(line_path([(960, 360), (960, 398)]))
    parts.append(line_path([(960, 470), (960, 492)]))
    parts.append(line_path([(960, 564), (960, 586)]))
    parts.append(line_path([(860, 664), (560, 734)]))
    parts.append(line_path([(1060, 664), (1360, 734)]))

    parts.append(arrow_label(504, 676, 208, "Low Latency & High Privacy"))
    parts.append(arrow_label(1206, 676, 150, "Heavy Compute"))

    parts.append(line_path([(560, 808), (540, 920)], dashed=True, opacity=0.9))
    parts.append(line_path([(1360, 808), (942, 920)], dashed=True, opacity=0.9))
    parts.append(line_path([(1160, 530), (1160, 610), (1462, 610), (1462, 920)], dashed=True, opacity=0.95))

    return frame_shell(
        "07",
        "Slide 7 - Constraint-Aware Inference Routing",
        "Constraint-aware routing across local and cloud inference targets with shared governance.",
        "".join(parts),
    )


def slide_08() -> str:
    parts: list[str] = []
    parts.append(container(90, 180, 820, 760, "Baseline: Vanilla RAG"))
    parts.append(container(1010, 180, 820, 760, "Proposed: Hybrid GraphRAG", accent=ACCENT))

    left_x = 240
    right_x = 1070
    left_w = 520
    right_w = 420
    top_y = 286
    gap = 118

    parts.extend(
        [
            node(left_x, top_y, left_w, 78, "Data: Flat Chunks"),
            node(left_x, top_y + gap, left_w, 78, "Retrieve: Vector Top-k"),
            node(left_x, top_y + gap * 2, left_w, 78, "Generate: Prompt + Chunks"),
            node(
                left_x,
                top_y + gap * 3,
                left_w,
                82,
                ["Cite: Weak Chunk-level", "Attribution"],
                kind="warning",
            ),
        ]
    )
    parts.extend(
        [
            node(
                right_x,
                top_y,
                right_w,
                78,
                ["Data: Chunks +", "Knowledge Graph"],
                kind="highlight",
            ),
            node(
                right_x,
                top_y + gap,
                right_w,
                78,
                ["Retrieve: Seed Vector +", "K-hop Expansion"],
                kind="highlight",
            ),
            node(
                right_x,
                top_y + gap * 2,
                right_w,
                78,
                ["Generate: Prompt +", "Structured Evidence"],
            ),
            node(
                right_x,
                top_y + gap * 3,
                right_w,
                82,
                "Cite: Strict Evidence Alignment",
                kind="highlight",
            ),
        ]
    )
    parts.append(
        note_box(
            1520,
            392,
            248,
            178,
            "Why Graph in Education?",
            [
                "- Captures structured dependencies",
                "- Enables multi-hop reasoning",
                "- Ensures strict logic traceability",
            ],
        )
    )

    for x_mid in (500, 1280):
        parts.append(line_path([(x_mid, 364), (x_mid, 404)]))
        parts.append(line_path([(x_mid, 482), (x_mid, 522)]))
        parts.append(line_path([(x_mid, 600), (x_mid, 640)]))

    return frame_shell(
        "08",
        "Slide 8 - Vanilla RAG vs Hybrid GraphRAG",
        "A side-by-side comparison of retrieval structure, evidence alignment, and citation fidelity.",
        "".join(parts),
    )


def slide_09() -> str:
    parts: list[str] = []
    stage_y = 250
    stage_h = 620
    stage_w = 280
    stage_x = [250, 560, 870, 1180, 1490]

    titles = [
        "Stage 1 - Seed",
        "Stage 2 - Expand",
        "Stage 3 - Rerank",
        "Stage 4 - Align",
        "Stage 5 - Generate",
    ]
    for idx, x in enumerate(stage_x):
        accent = ACCENT if idx in (1, 3, 4) else INK
        parts.append(container(x, stage_y, stage_w, stage_h, titles[idx], accent=accent))

    parts.append(node(82, 514, 130, 56, "Query"))

    parts.append(node(280, 488, 220, 78, "Vector Search"))
    parts.append(node(590, 404, 220, 78, "Entity Linking"))
    parts.append(node(590, 540, 220, 78, "K-hop Subgraph", kind="highlight"))
    parts.append(node(900, 404, 220, 78, "Hybrid Scoring"))
    parts.append(node(900, 540, 220, 78, "Cross-Encoder Rerank"))
    parts.append(node(1210, 404, 220, 78, "Evidence Binding", kind="highlight"))
    parts.append(node(1210, 540, 220, 78, "Context Packing"))
    parts.append(node(1520, 404, 220, 78, "LLM Generation"))
    parts.append(
        node(
            1520,
            540,
            220,
            88,
            ["Answer +", "Traceable Citations"],
            kind="highlight",
        )
    )

    parts.append(line_path([(212, 542), (250, 542)]))
    for x in (530, 840, 1150, 1460):
        parts.append(line_path([(x, 542), (x + 30, 542)]))

    parts.append(line_path([(700, 482), (700, 540)]))
    parts.append(line_path([(1010, 482), (1010, 540)]))
    parts.append(line_path([(1320, 482), (1320, 540)]))
    parts.append(line_path([(1630, 482), (1630, 540)]))

    return frame_shell(
        "09",
        "Slide 9 - Hybrid GraphRAG Retrieval Pipeline",
        "Five-stage Hybrid GraphRAG pipeline from seed retrieval to traceable answer generation.",
        "".join(parts),
    )


def slide_10() -> str:
    parts: list[str] = []
    parts.append(container(170, 180, 1580, 160, "Layer 1 - Orchestration"))
    parts.append(container(110, 380, 1700, 200, "Layer 2 - Expert Agents"))
    parts.append(container(300, 620, 1320, 150, "Layer 3 - Tooling"))
    parts.append(container(450, 810, 1020, 220, "Layer 4 - Verification", accent=ACCENT))

    planner_x = 370
    shared_x = 1110
    parts.append(
        node(
            planner_x,
            234,
            440,
            78,
            "Planner Agent",
            subtitle_lines="Task Decomposition",
        )
    )
    parts.append(
        node(
            shared_x,
            234,
            440,
            78,
            "Shared Memory",
            subtitle_lines="StateGraph",
            kind="highlight",
        )
    )
    parts.append(
        line_path(
            [(810, 273), (1110, 273)],
            marker_start="arrow-dark",
            marker_end="arrow-dark",
            width=2.2,
        )
    )

    expert_specs = [
        (190, "Researcher Agent", "Theory"),
        (745, "Coder Agent", "Programming"),
        (1300, "Visual Analyst", "Charts / Images"),
    ]
    centers = []
    for x, title, subtitle in expert_specs:
        parts.append(node(x, 450, 430, 78, title, subtitle_lines=subtitle))
        centers.append(x + 215)

    bus_y = 420
    planner_mid = planner_x + 220
    parts.append(line_path([(planner_mid, 312), (planner_mid, bus_y)], marker_end=None))
    parts.append(
        f'<line {attrs(x1=centers[0], y1=bus_y, x2=centers[-1], y2=bus_y, stroke=LINE, stroke_width=2.5, stroke_linecap="round")}/>'
    )
    parts.append(line_path([(planner_mid, bus_y), (centers[0], bus_y)], marker_end=None))
    parts.append(line_path([(planner_mid, bus_y), (centers[-1], bus_y)], marker_end=None))
    for cx in centers:
        parts.append(line_path([(cx, bus_y), (cx, 450)]))

    parts.append(node(360, 680, 320, 60, "GraphRAG-X", kind="highlight"))
    parts.append(node(600, 680, 300, 60, "Code Sandbox"))
    parts.append(line_path([(405, 528), (405, 680)], dashed=True))
    parts.append(line_path([(960, 528), (750, 680)], dashed=True))

    parts.append(
        f'<line {attrs(x1=centers[0], y1=586, x2=centers[-1], y2=586, stroke=LINE, stroke_width=2.5, stroke_linecap="round")}/>'
    )
    for cx in centers:
        parts.append(line_path([(cx, 528), (cx, 586)]))
    parts.append(line_path([(960, 586), (960, 846)]))

    parts.append(
        node(
            660,
            846,
            600,
            82,
            "Verifier Agent",
            subtitle_lines="Consistency Check",
            kind="note",
        )
    )
    parts.append(chip(910, 942, 100, 30, "Pass", fill=LIGHT_GOLD, stroke=GOLD, text_fill=INK))
    parts.append(
        node(
            760,
            972,
            400,
            58,
            "Final Academic Answer",
            kind="result",
        )
    )
    parts.append(line_path([(960, 928), (960, 972)]))

    fallback_points = [(660, 887), (248, 887), (248, 273), (370, 273)]
    parts.append(line_path(fallback_points, color=RED, width=4, dashed=True, marker_end="arrow-red"))
    parts.append(
        note_box(
            114,
            606,
            192,
            80,
            "Fallback Loop",
            ["Conflict / Hallucination", "returns control to Planner."],
            kind="warn",
        )
    )

    return frame_shell(
        "10",
        "Slide 10 - Multi-Agent Orchestration with Verification Loop",
        "Planner-led multi-agent execution with mandatory verification and fallback recovery.",
        "".join(parts),
    )


def wrap_svg(width: int, height: int, body: str, *, background: str = BG) -> str:
    defs = """
<defs>
  <marker id="arrow-dark" markerWidth="14" markerHeight="14" refX="10" refY="7" orient="auto" markerUnits="strokeWidth">
    <path d="M 0 0 L 12 7 L 0 14 z" fill="#4B4B4B"/>
  </marker>
  <marker id="arrow-red" markerWidth="14" markerHeight="14" refX="10" refY="7" orient="auto" markerUnits="strokeWidth">
    <path d="M 0 0 L 12 7 L 0 14 z" fill="#C53030"/>
  </marker>
</defs>
""".strip()
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">\n'
        f'{defs}\n'
        f'<rect width="{width}" height="{height}" fill="{background}"/>\n'
        f"{body}\n"
        "</svg>\n"
    )


def render_all() -> dict[str, str]:
    slides = {
        "slide-07-constraint-aware-inference-routing.svg": slide_07(),
        "slide-08-vanilla-rag-vs-hybrid-graphrag.svg": slide_08(),
        "slide-09-hybrid-graphrag-retrieval-pipeline.svg": slide_09(),
        "slide-10-multi-agent-orchestration-verification-loop.svg": slide_10(),
    }

    composite = [
        f'<g transform="translate({GRID_MARGIN} {GRID_MARGIN})">{slides["slide-07-constraint-aware-inference-routing.svg"]}</g>',
        f'<g transform="translate({GRID_MARGIN + SLIDE_W + GRID_GAP} {GRID_MARGIN})">{slides["slide-08-vanilla-rag-vs-hybrid-graphrag.svg"]}</g>',
        f'<g transform="translate({GRID_MARGIN} {GRID_MARGIN + SLIDE_H + GRID_GAP})">{slides["slide-09-hybrid-graphrag-retrieval-pipeline.svg"]}</g>',
        f'<g transform="translate({GRID_MARGIN + SLIDE_W + GRID_GAP} {GRID_MARGIN + SLIDE_H + GRID_GAP})">{slides["slide-10-multi-agent-orchestration-verification-loop.svg"]}</g>',
    ]

    output = {
        name: wrap_svg(SLIDE_W, SLIDE_H, content) for name, content in slides.items()
    }
    output["slides-07-10-academic-architecture-grid.svg"] = wrap_svg(
        GRID_W,
        GRID_H,
        "".join(composite),
    )
    return output


def main() -> None:
    diagram_root = Path(__file__).resolve().parents[1]
    export_dir = diagram_root / "exports" / "academic-defense"
    export_dir.mkdir(parents=True, exist_ok=True)

    rendered = render_all()
    for filename, svg in rendered.items():
        (export_dir / filename).write_text(svg, encoding="utf-8")

    print(f"Generated {len(rendered)} SVG files in {export_dir}")


if __name__ == "__main__":
    main()
