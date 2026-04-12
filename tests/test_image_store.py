from unittest.mock import patch

import numpy as np

from backend.app.services.image_store import build_centroid_embedding


def test_build_centroid_embedding_uses_mean_pooling():
    embeddings = {
        "img1": np.array([1.0, 3.0], dtype=np.float32),
        "img2": np.array([5.0, 7.0], dtype=np.float32),
    }

    def fake_encode_remote_image(image_id: str, *, embedder):
        return embeddings[image_id]

    with patch(
        "backend.app.services.image_store.encode_remote_image",
        side_effect=fake_encode_remote_image,
    ):
        centroid = build_centroid_embedding(
            image_ids=["img1", "img2"],
            embedder=object(),
            max_download_workers=1,
        )

    np.testing.assert_allclose(centroid, np.array([[3.0, 5.0]], dtype=np.float32))
