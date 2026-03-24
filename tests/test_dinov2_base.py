from types import SimpleNamespace
from unittest.mock import patch

import numpy as np
import torch
from PIL import Image

from mediscan.embedders.dinov2_base import DINOv2BaseEmbedder


class FakeProcessor:
    def __call__(self, *, images, return_tensors):
        return {"pixel_values": torch.ones((1, 3, 2, 2), dtype=torch.float32)}


class FakeDINOModel:
    def __init__(self) -> None:
        self.config = SimpleNamespace(hidden_size=4)

    def to(self, device):
        return self

    def eval(self):
        return self

    def __call__(self, *, pixel_values):
        return SimpleNamespace(
            pooler_output=torch.tensor([[1.0, 2.0, 3.0, 4.0]], dtype=torch.float32)
        )


def test_dinov2_embedding_shape():
    with patch(
        "mediscan.embedders.dinov2_base.AutoImageProcessor.from_pretrained",
        return_value=FakeProcessor(),
    ), patch(
        "mediscan.embedders.dinov2_base.AutoModel.from_pretrained",
        return_value=FakeDINOModel(),
    ):
        embedder = DINOv2BaseEmbedder(model_name="facebook/dinov2-base")

    vector = embedder.encode_pil(Image.new("RGB", (224, 224), color=(0, 255, 0)))
    assert vector.shape == (embedder.dim,)
    assert np.isfinite(vector).all()
    np.testing.assert_almost_equal(np.linalg.norm(vector), 1.0, decimal=5)
