"""Core retrieval helpers shared by CLI scripts and the backend API."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import faiss
import numpy as np
from PIL import Image

from mediscan.embedders.base import Embedder
from mediscan.runtime import (
    build_embedder,
    compute_search_k,
    default_config_for_mode,
    ensure_artifacts_exist,
    is_visual_embedder,
    load_indexed_rows,
    resolve_path,
    set_faiss_threads,
)
from mediscan.visual_similarity import rerank_visual_results

MAX_K = 50


@dataclass
class SearchResources:
    """Pre-loaded resources for running multiple queries without reloading."""

    embedder: Embedder
    index: faiss.Index
    rows: list[dict[str, str]]


def load_resources(
    *,
    mode: str,
    embedder: str | None = None,
    model_name: str | None = None,
    index_path: str | Path | None = None,
    ids_path: str | Path | None = None,
) -> SearchResources:
    """Load embedder, FAISS index, and metadata once for repeated queries."""
    set_faiss_threads(faiss)

    default_embedder, default_index_path, default_ids_path = default_config_for_mode(mode)
    embedder_name = embedder or default_embedder
    resolved_index = index_path if index_path is not None else default_index_path
    resolved_ids = ids_path if ids_path is not None else default_ids_path
    index_path_obj, ids_path_obj = ensure_artifacts_exist(resolved_index, resolved_ids)

    rows = load_indexed_rows(ids_path_obj)
    faiss_index = faiss.read_index(str(index_path_obj))
    if faiss_index.ntotal == 0:
        raise RuntimeError("FAISS index is empty")
    if len(rows) != faiss_index.ntotal:
        raise RuntimeError(
            f"Index/IDs mismatch: index.ntotal={faiss_index.ntotal}, ids={len(rows)}"
        )

    image_embedder = build_embedder(embedder_name, model_name=model_name)
    if image_embedder.dim != faiss_index.d:
        raise RuntimeError(
            f"Index dimension ({faiss_index.d}) does not match embedder ({image_embedder.dim})"
        )

    return SearchResources(embedder=image_embedder, index=faiss_index, rows=rows)


def query(
    *,
    resources: SearchResources,
    image: str | Path,
    k: int,
    exclude_self: bool = False,
) -> list[dict[str, Any]]:
    """Run one top-k retrieval query on pre-loaded resources."""
    if not 0 < k <= MAX_K:
        raise ValueError(f"k must be between 1 and {MAX_K}")

    query_image = resolve_path(image)
    if not query_image.exists():
        raise FileNotFoundError(f"Query image not found: {query_image}")

    embedder = resources.embedder
    index = resources.index
    rows = resources.rows

    with Image.open(query_image) as pil_image:
        query_vector = embedder.encode_pil(pil_image).reshape(1, -1).astype(np.float32)
    faiss.normalize_L2(query_vector)

    search_k = compute_search_k(
        embedder.name,
        k,
        index.ntotal,
        exclude_self=exclude_self,
    )
    scores, indices = index.search(query_vector, search_k)

    query_abs = str(query_image.resolve())
    query_stem = query_image.stem
    results: list[dict[str, Any]] = []

    for idx, score in zip(indices[0], scores[0]):
        if idx < 0:
            continue
        row = rows[idx]
        image_id = str(row.get("image_id", ""))
        relative_path = str(row.get("path", ""))
        absolute_path = str(resolve_path(relative_path).resolve()) if relative_path else ""

        if exclude_self and (absolute_path == query_abs or image_id == query_stem):
            continue

        results.append(
            {
                "rank": len(results) + 1,
                "score": float(score),
                "image_id": image_id,
                "path": relative_path,
                "caption": str(row.get("caption", "")),
                "cui": str(row.get("cui", "")),
            }
        )
        if not is_visual_embedder(embedder.name) and len(results) >= k:
            break

    if is_visual_embedder(embedder.name):
        results = rerank_visual_results(
            query_image=query_image,
            candidates=results,
            resolve_path=resolve_path,
            limit=k,
        )

    return results


def search_image(
    *,
    mode: str,
    image: str | Path,
    k: int,
    embedder: str | None = None,
    model_name: str | None = None,
    index_path: str | Path | None = None,
    ids_path: str | Path | None = None,
    exclude_self: bool = False,
) -> tuple[str, str, list[dict[str, Any]]]:
    """Convenience wrapper: load resources and run one query."""
    resources = load_resources(
        mode=mode,
        embedder=embedder,
        model_name=model_name,
        index_path=index_path,
        ids_path=ids_path,
    )
    results = query(
        resources=resources,
        image=image,
        k=k,
        exclude_self=exclude_self,
    )
    return resources.embedder.name, str(resolve_path(image)), results


__all__ = ["MAX_K", "SearchResources", "load_resources", "query", "search_image"]
