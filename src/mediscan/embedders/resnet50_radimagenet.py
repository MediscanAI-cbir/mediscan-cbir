"""
ResNet50 RadImageNet embedder implementation (CPU-only).

This module provides a concrete Embedder that:
- builds a torchvision ResNet50 backbone,
- loads RadImageNet weights from a local .pt file,
- removes the classification head (fc) to output 2048-D features,
- returns L2-normalized float32 embeddings suitable for FAISS cosine search
  (via inner product on normalized vectors).

Expected weights format:
- an OrderedDict / Mapping[str, Tensor] (state_dict-like),
  with keys prefixed by "backbone." (as in RadImageNet PyTorch release).
"""

from __future__ import annotations

import os
from collections import OrderedDict
from collections.abc import Mapping
from pathlib import Path

import numpy as np
import torch
from PIL import Image as PILImage
from torch import nn
from torchvision import models, transforms

from .base import Embedder


class ResNet50RadImageNetEmbedder(Embedder):
    """
    ResNet50 feature extractor returning 2048-D normalized embeddings.

    Notes
    -----
    - CPU-only by design (project constraint).
    - Output vectors are L2-normalized to enable cosine similarity search
      with FAISS IndexFlatIP.
    - The RadImageNet checkpoint uses "backbone.*" prefixes, so keys are
      adapted before loading into torchvision's ResNet50.
    """

    # Public identifier used by the factory (e.g., --embedder resnet50_radimagenet)
    name = "resnet50_radimagenet"

    # ResNet50 penultimate feature size (after removing fc)
    dim = 2048

    # Heuristics to detect "too incompatible" checkpoints
    _MAX_MISMATCH_KEYS = 20
    _MAX_MISMATCH_RATIO = 0.10

    def __init__(self, weights_path: str | Path = "weights/resnet50_radimagenet.pt") -> None:
        """
        Build the model, define preprocessing, and load weights.

        Parameters
        ----------
        weights_path : str | Path
            Path to the RadImageNet ResNet50 checkpoint (.pt).
        """
        # Conservative CPU threading defaults:
        # Some hosts become unstable / slow when torch uses many threads.
        thread_count = self._safe_int(os.getenv("MEDISCAN_TORCH_THREADS"), default=1)
        torch.set_num_threads(max(1, thread_count))
        try:
            torch.set_num_interop_threads(1)
        except RuntimeError:
            # Can only be set once per process; ignore if already set.
            pass

        self._weights_path = Path(weights_path)
        self._device = torch.device("cpu")

        # Build ResNet50 without ImageNet weights (we will load RadImageNet).
        self._model = models.resnet50(weights=None)

        # Remove classification head so forward() returns 2048-D features.
        self._model.fc = nn.Identity()

        self._model.to(self._device)
        self._model.eval()

        # Standard ImageNet normalization (commonly used unless specified otherwise).
        self._preprocess = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

        # Load and adapt RadImageNet weights into torchvision ResNet50.
        self._load_weights()

    def _load_weights(self) -> None:
        """
        Load RadImageNet weights from disk and inject them into the model.

        The checkpoint keys are adapted (e.g. "backbone.0.weight" -> "conv1.weight")
        to match torchvision's ResNet50 state_dict naming.
        """
        if not self._weights_path.exists():
            raise FileNotFoundError(f"Weights file not found: {self._weights_path}")

        checkpoint = torch.load(self._weights_path, map_location="cpu")
        state_dict = self._extract_state_dict(checkpoint)

        # Adapt keys so they match torchvision's naming.
        adapted_state = OrderedDict()
        for key, value in state_dict.items():
            if not isinstance(key, str):
                continue
            adapted_state[self._adapt_key(key)] = value

        # strict=False allows small differences (e.g., missing fc.* which we removed).
        load_result = self._model.load_state_dict(adapted_state, strict=False)
        missing = list(load_result.missing_keys)
        unexpected = list(load_result.unexpected_keys)

        # Validate whether mismatch is acceptable.
        self._validate_loading(missing=missing, unexpected=unexpected)

    def _extract_state_dict(self, checkpoint: object) -> Mapping[str, torch.Tensor]:
        """
        Extract a state_dict-like mapping from various checkpoint formats.

        Supported formats:
        - Mapping[str, Tensor] directly (state_dict)
        - Mapping with a "state_dict" key containing Mapping[str, Tensor]
        """
        if isinstance(checkpoint, Mapping):
            # Case 1: checkpoint IS the state_dict: keys are strings, values are tensors.
            if all(isinstance(k, str) for k in checkpoint.keys()):
                first_value = next(iter(checkpoint.values()), None)
                if isinstance(first_value, torch.Tensor):
                    return checkpoint  # type: ignore[return-value]

            # Case 2: checkpoint is a dict with "state_dict" inside.
            raw_state = checkpoint.get("state_dict")
            if isinstance(raw_state, Mapping):
                return raw_state  # type: ignore[return-value]

        raise TypeError(
            "Unsupported checkpoint format. Expected an OrderedDict[str, Tensor] "
            "or a mapping containing a 'state_dict' key."
        )

    @staticmethod
    def _adapt_key(key: str) -> str:
        """
        Adapt RadImageNet key names to torchvision ResNet50 key names.

        Examples
        --------
        - "module.backbone.0.weight" -> "conv1.weight"
        - "backbone.1.running_mean"  -> "bn1.running_mean"
        - "backbone.4.0.conv1.weight" -> "layer1.0.conv1.weight"

        The RadImageNet release commonly uses:
        backbone.0 = conv1
        backbone.1 = bn1
        backbone.4 = layer1
        backbone.5 = layer2
        backbone.6 = layer3
        backbone.7 = layer4
        """
        normalized = key

        # If weights were saved with DataParallel, remove "module." prefix.
        if normalized.startswith("module."):
            normalized = normalized.removeprefix("module.")

        # If not a backbone key, keep as is.
        if not normalized.startswith("backbone."):
            return normalized

        # Remove "backbone." prefix and map the first block id.
        suffix = normalized.removeprefix("backbone.")
        parts = suffix.split(".", maxsplit=1)
        block = parts[0]
        tail = parts[1] if len(parts) > 1 else ""

        mapping = {
            "0": "conv1",
            "1": "bn1",
            "4": "layer1",
            "5": "layer2",
            "6": "layer3",
            "7": "layer4",
        }

        mapped = mapping.get(block)
        if mapped is None:
            # Unknown block id: return suffix as fallback.
            return suffix

        return f"{mapped}.{tail}" if tail else mapped

    def _validate_loading(self, missing: list[str], unexpected: list[str]) -> None:
        """
        Validate weight loading mismatches.

        If the checkpoint is too incompatible with torchvision ResNet50, raise an error.
        Otherwise, print a warning with a summary.
        """
        total_model_keys = len(self._model.state_dict())
        mismatch = len(missing) + len(unexpected)
        mismatch_ratio = mismatch / max(total_model_keys, 1)

        if mismatch == 0:
            return

        summary = (
            "Weight loading mismatch for ResNet50 RadImageNet: "
            f"missing={len(missing)}, unexpected={len(unexpected)}, "
            f"total_model_keys={total_model_keys}, mismatch_ratio={mismatch_ratio:.2%}."
        )

        # If too many mismatches, something is wrong (wrong checkpoint / wrong mapping).
        if mismatch > self._MAX_MISMATCH_KEYS and mismatch_ratio > self._MAX_MISMATCH_RATIO:
            missing_preview = ", ".join(missing[:5]) if missing else "none"
            unexpected_preview = ", ".join(unexpected[:5]) if unexpected else "none"
            raise RuntimeError(
                f"{summary} Too many incompatible keys. "
                f"missing_preview=[{missing_preview}] "
                f"unexpected_preview=[{unexpected_preview}]"
            )

        # Small mismatches may be acceptable (e.g. removed fc layer).
        print(f"[WARN] {summary}")

    @staticmethod
    def _safe_int(value: str | None, default: int) -> int:
        """Parse an env var integer safely; fallback to default."""
        if value is None:
            return default
        try:
            return int(value)
        except ValueError:
            return default

    def encode_pil(self, image: PILImage.Image) -> np.ndarray:
        """
        Encode a PIL image into a 2048-D embedding.

        Steps:
        1) Convert to RGB
        2) Resize to 224x224
        3) Convert to tensor + normalize
        4) Forward pass (no_grad)
        5) Convert to numpy float32
        6) L2-normalize and return
        """
        if not isinstance(image, PILImage.Image):
            raise TypeError("encode_pil expects a PIL.Image.Image instance")

        rgb_image = image.convert("RGB")
        input_tensor = self._preprocess(rgb_image).unsqueeze(0).to(self._device)

        with torch.no_grad():
            embedding = self._model(input_tensor)

        vector = embedding.squeeze(0).cpu().numpy().astype(np.float32, copy=False)

        if vector.shape != (self.dim,):
            raise RuntimeError(
                f"Unexpected embedding shape: got {vector.shape}, expected ({self.dim},)"
            )

        norm = float(np.linalg.norm(vector))
        if not np.isfinite(norm) or norm <= 0.0:
            raise RuntimeError("Embedding norm is invalid; cannot apply L2 normalization")

        vector /= norm
        return vector


__all__ = ["ResNet50RadImageNetEmbedder"]