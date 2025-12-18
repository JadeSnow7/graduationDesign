from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .index import Chunk, GraphRAGIndex


def _bigrams(text: str) -> set[str]:
    s = "".join(text.split()).lower()
    if len(s) < 2:
        return {s} if s else set()
    return {s[i : i + 2] for i in range(len(s) - 1)}


@dataclass(frozen=True)
class RetrievedChunk:
    chunk: Chunk
    score: float


def _score(query_bigrams: set[str], chunk_text: str) -> float:
    if not query_bigrams:
        return 0.0
    chunk_bigrams = _bigrams(chunk_text)
    if not chunk_bigrams:
        return 0.0
    overlap = len(query_bigrams & chunk_bigrams)
    return overlap / max(1, len(query_bigrams))


def _expand_nodes(index: GraphRAGIndex, seed_node_ids: set[str], hops: int) -> set[str]:
    if hops <= 0:
        return set(seed_node_ids)
    visited = set(seed_node_ids)
    frontier = set(seed_node_ids)
    for _ in range(hops):
        if not frontier:
            break
        nxt: set[str] = set()
        for nid in frontier:
            for nb in index.node_neighbors.get(nid, ()):
                if nb not in visited:
                    visited.add(nb)
                    nxt.add(nb)
        frontier = nxt
    return visited


def _rank_chunks(index: GraphRAGIndex, query: str, chunk_ids: Iterable[str], top_k: int) -> list[RetrievedChunk]:
    q = query.strip()
    if not q:
        return []
    q_bigrams = _bigrams(q)
    scored: list[RetrievedChunk] = []
    for cid in chunk_ids:
        ch = index.chunks.get(cid)
        if not ch:
            continue
        s = _score(q_bigrams, ch.text)
        if s <= 0:
            continue
        scored.append(RetrievedChunk(chunk=ch, score=s))
    scored.sort(key=lambda x: (x.score, -len(x.chunk.text)), reverse=True)
    return scored[: max(1, top_k)]


def build_rag_context(
    index: GraphRAGIndex,
    query: str,
    *,
    seed_top_k: int = 4,
    expand_hops: int = 1,
    final_top_k: int = 8,
    max_chars: int = 4000,
) -> str:
    seed = _rank_chunks(index, query, index.chunks.keys(), top_k=seed_top_k)
    if not seed:
        return ""

    seed_chunk_ids = {r.chunk.id for r in seed}
    seed_node_ids: set[str] = set()
    for cid in seed_chunk_ids:
        seed_node_ids.update(index.chunk_to_nodes.get(cid, ()))

    all_node_ids = _expand_nodes(index, seed_node_ids, hops=expand_hops)
    expanded_chunk_ids: set[str] = set(seed_chunk_ids)
    for nid in all_node_ids:
        node = index.nodes.get(nid)
        if not node:
            continue
        expanded_chunk_ids.update(node.chunk_ids)

    ranked = _rank_chunks(index, query, expanded_chunk_ids, top_k=final_top_k)
    if not ranked:
        return ""

    parts: list[str] = []
    used = 0
    for i, r in enumerate(ranked, start=1):
        ch = r.chunk
        header = f"[{i}] {ch.source or 'unknown'}"
        if ch.section:
            header += f"#{ch.section}"
        text = ch.text.strip()
        block = header + "\n" + text
        if used + len(block) + 2 > max_chars:
            break
        parts.append(block)
        used += len(block) + 2

    return "\n\n".join(parts).strip()

