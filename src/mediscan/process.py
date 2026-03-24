"""Process-level helpers shared by scripts and the backend."""

from __future__ import annotations

import os


def configure_cpu_environment() -> None:
    """Set conservative defaults for CPU-only execution."""
    os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
    os.environ.setdefault("OMP_NUM_THREADS", "1")


__all__ = ["configure_cpu_environment"]
