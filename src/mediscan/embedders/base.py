"""
Base interface for image embedders.

This module defines the minimal contract that any embedder must satisfy to be
plugged into the CBIR pipeline (index building and querying).

Why an interface?
- It decouples feature extraction (deep model, handcrafted features, etc.)
  from the rest of the system (FAISS indexing, search, evaluation).
- It makes the system flexible: you can swap the neural network (ResNet50,
  DenseNet, CLIP, etc.) without changing the indexing/query code.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

import numpy as np
from PIL import Image as PILImage


class Embedder(ABC):
    """
    Abstract base class (interface) for all embedders.

    An embedder converts an input image into a fixed-size numeric vector
    ("embedding") that represents its visual content. These vectors are then:
    - stored in a FAISS index (offline indexing),
    - compared to a query vector at search time (online retrieval).

    Attributes
    ----------
    name : str
        Stable identifier used to select an embedder (e.g. "resnet50_radimagenet").
    dim : int
        Dimensionality of the output embedding vector (e.g. 2048 for ResNet50).

    Notes
    -----
    Implementations MUST return:
    - a 1D NumPy array of shape (dim,)
    - dtype float32
    - L2-normalized (||v||2 ~= 1), so that cosine similarity can be computed
      efficiently using inner product (IndexFlatIP).
    """

    name: str
    dim: int

    @abstractmethod
    def encode_pil(self, image: PILImage.Image) -> np.ndarray:
        """
        Encode a PIL image into an embedding vector.

        Parameters
        ----------
        image : PIL.Image.Image
            Input image (already loaded). Implementations may convert to RGB,
            resize, normalize, etc. depending on model requirements.

        Returns
        -------
        np.ndarray
            A 1D L2-normalized embedding vector of shape (dim,), dtype float32.

        Raises
        ------
        ValueError
            If the image is invalid or cannot be processed.
        """
        raise NotImplementedError


__all__ = ["Embedder"]