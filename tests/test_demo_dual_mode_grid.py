from pathlib import Path
from unittest.mock import patch, MagicMock

from PIL import Image

from scripts.visualization import demo_dual_mode_grid as demo


class FakeRecord:
    def __init__(self, image_id: str, caption: str, path: str, cui: str = "[]"):
        self.image_id = image_id
        self.caption = caption
        self.path = path
        self.cui = cui


def test_auto_choose_query_prefers_expected_records():
    visual_record, _ = demo.auto_choose_query(
        [
            FakeRecord("sem", "Head CT demonstrating hemorrhage", "a.png", '["C1"]'),
            FakeRecord("vis", "Chest radiograph postero-anterior view", "b.png", '["C2"]'),
        ],
        mode="visual",
    )
    semantic_record, _ = demo.auto_choose_query(
        [
            FakeRecord("vis", "Chest radiograph postero-anterior view", "b.png", '["C2"]'),
            FakeRecord("sem", "Head CT demonstrating hemorrhage and aneurysm", "a.png", '["C1", "C3"]'),
        ],
        mode="semantic",
    )

    assert visual_record.image_id == "vis"
    assert semantic_record.image_id == "sem"


def test_run_image_search_delegates_to_search_pipeline(tmp_path):
    image_path = tmp_path / "query.png"
    Image.new("RGB", (8, 8)).save(image_path)

    fake_results = [
        {"rank": 1, "image_id": "other", "path": "x.png", "score": 0.5, "caption": "x", "cui": "[]"}
    ]

    with patch("scripts.visualization.demo_dual_mode_grid.load_resources") as mock_load, \
         patch("scripts.visualization.demo_dual_mode_grid.query", return_value=fake_results) as mock_query:
        mock_load.return_value = MagicMock()
        results = demo.run_image_search(
            query_image=image_path,
            mode="visual",
            model_name=None,
            index_path=tmp_path / "index.faiss",
            ids_path=tmp_path / "ids.json",
            k=1,
        )

    assert results[0]["image_id"] == "other"
    mock_load.assert_called_once()
    mock_query.assert_called_once()
