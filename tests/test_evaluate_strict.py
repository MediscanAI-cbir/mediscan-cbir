from types import SimpleNamespace
from unittest.mock import patch

from scripts.evaluation import evaluate_strict as strict_module


def test_evaluate_strict_uses_index_vectors_even_if_query_path_is_missing():
    query_rows = [
        {
            "image_id": "img1",
            "path": "data/roco_train_full/images/img1.png",
        }
    ]
    resources = SimpleNamespace(row_index_by_image_id={"img1": 0})

    gt_full = {
        "img1": {"modalite": "CT", "organe": "lung", "mo": "ct_lung"},
        "img2": {"modalite": "CT", "organe": "lung", "mo": "ct_lung"},
    }
    gt_strict = dict(gt_full)

    with patch.object(
        strict_module,
        "query_from_index",
        return_value=[{"image_id": "img2"}],
    ):
        query_results, result_details = strict_module.evaluate_strict(
            query_rows=query_rows,
            resources=resources,
            k=10,
            gt_full=gt_full,
            gt_strict=gt_strict,
            mode="semantic",
        )

    assert len(query_results) == 1
    assert len(result_details) == 1
    assert query_results[0]["query_id"] == "img1"
    assert query_results[0]["hit_modalite"] == 1
    assert query_results[0]["hit_organe"] == 1
    assert query_results[0]["hit_mo"] == 1
    assert result_details[0]["result_id"] == "img2"
