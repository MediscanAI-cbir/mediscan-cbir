"""Shared runtime helpers for MEDISCAN scripts."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from mediscan.embedders.factory import get_embedder
from mediscan.visual_similarity import VISUAL_SHORTLIST_SIZE

PROJECT_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class ModeConfig:
    """Stable configuration for one supported retrieval mode."""

    mode: str
    embedder: str
    index_path: Path
    ids_path: Path
    manifest_path: Path


STABLE_MODE_CONFIGS = {
    "visual": ModeConfig(
        mode="visual",
        embedder="dinov2_base",
        index_path=PROJECT_ROOT / "artifacts" / "index.faiss",
        ids_path=PROJECT_ROOT / "artifacts" / "ids.json",
        manifest_path=PROJECT_ROOT / "artifacts" / "manifests" / "visual_stable.json",
    ),
    "semantic": ModeConfig(
        mode="semantic",
        embedder="biomedclip",
        index_path=PROJECT_ROOT / "artifacts" / "index_semantic.faiss",
        ids_path=PROJECT_ROOT / "artifacts" / "ids_semantic.json",
        manifest_path=PROJECT_ROOT / "artifacts" / "manifests" / "semantic_stable.json",
    ),
}
VISUAL_EMBEDDERS = frozenset({"dinov2_base"})
SEMANTIC_EMBEDDERS = frozenset({"biomedclip"})
SUPPORTED_MODES = frozenset(STABLE_MODE_CONFIGS)


def resolve_path(raw_path: str | Path, base_dir: Path | None = None) -> Path:
    """Resolve a path against the project root or an optional base directory."""
    path = Path(raw_path)
    if path.is_absolute():
        return path
    if base_dir is not None:
        return Path(base_dir) / path
    return PROJECT_ROOT / path


def get_mode_config(mode: str) -> ModeConfig:
    """Return the stable artifact configuration for one retrieval mode."""
    normalized = mode.strip().lower()
    config = STABLE_MODE_CONFIGS.get(normalized)
    if config is None:
        raise ValueError(f"Unsupported mode: {mode}")
    return config


def default_config_for_mode(mode: str) -> tuple[str, Path, Path]:
    """Return the default embedder and index files for one retrieval mode."""
    config = get_mode_config(mode)
    return config.embedder, config.index_path, config.ids_path


def stable_manifest_path_for_mode(mode: str) -> Path:
    """Return the stable manifest path for one retrieval mode."""
    return get_mode_config(mode).manifest_path


def build_embedder(name: str, model_name: str | None = None):
    """Build one of the supported embedders."""
    kwargs: dict[str, object] = {}
    if model_name:
        kwargs["model_name"] = model_name
    return get_embedder(name, **kwargs)


def load_indexed_rows(ids_path: str | Path) -> list[dict[str, str]]:
    """Load the metadata rows aligned with a FAISS index."""
    path = resolve_path(ids_path)
    if not path.exists():
        raise FileNotFoundError(f"IDs file not found: {path}")

    with path.open("r", encoding="utf-8") as handle:
        rows = json.load(handle)

    if not isinstance(rows, list):
        raise RuntimeError("Invalid ids file format: expected a JSON list")
    if not rows:
        raise RuntimeError("IDs file is empty")
    return rows


def ensure_artifacts_exist(index_path: str | Path, ids_path: str | Path) -> tuple[Path, Path]:
    """Return artifact paths after verifying both files exist."""
    resolved_index = resolve_path(index_path)
    resolved_ids = resolve_path(ids_path)
    if not resolved_index.exists():
        raise FileNotFoundError(f"FAISS index not found: {resolved_index}")
    if not resolved_ids.exists():
        raise FileNotFoundError(f"IDs file not found: {resolved_ids}")
    return resolved_index, resolved_ids


def is_visual_embedder(name: str) -> bool:
    """Return True when the embedder belongs to the visual branch."""
    return name.strip().lower() in VISUAL_EMBEDDERS


def compute_search_k(
    embedder_name: str,
    k: int,
    ntotal: int,
    *,
    exclude_self: bool = False,
) -> int:
    """Choose how many candidates FAISS should return before optional reranking."""
    if is_visual_embedder(embedder_name):
        return min(ntotal, max(VISUAL_SHORTLIST_SIZE, k + 20))
    extra = 10 if exclude_self else 0
    return min(ntotal, k + extra)


def set_faiss_threads(faiss_module: object, count: int = 1) -> None:
    """Set FAISS CPU threads when supported by the installed wheel."""
    setter = getattr(faiss_module, "omp_set_num_threads", None)
    if callable(setter):
        setter(count)


__all__ = [
    "ModeConfig",
    "PROJECT_ROOT",
    "STABLE_MODE_CONFIGS",
    "SUPPORTED_MODES",
    "VISUAL_EMBEDDERS",
    "SEMANTIC_EMBEDDERS",
    "build_embedder",
    "compute_search_k",
    "default_config_for_mode",
    "ensure_artifacts_exist",
    "get_mode_config",
    "is_visual_embedder",
    "load_indexed_rows",
    "resolve_path",
    "set_faiss_threads",
    "stable_manifest_path_for_mode",
]
