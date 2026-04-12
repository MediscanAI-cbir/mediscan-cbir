from __future__ import annotations

from typing import Any

from backend.app.config import COLLECTION_NAME, DB_NAME, MONGO_URI


def _load_mongo_collection():
    if not MONGO_URI:
        return None

    try:
        from pymongo import MongoClient

        return MongoClient(MONGO_URI)[DB_NAME][COLLECTION_NAME]
    except Exception:
        return None


class MongoResultEnricher:
    """Optional metadata enrichment layer backed by MongoDB."""

    def __init__(self, collection=None) -> None:
        self._collection = collection

    @classmethod
    def from_environment(cls) -> "MongoResultEnricher":
        return cls(collection=_load_mongo_collection())

    def enrich(self, results: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if self._collection is None or not results:
            return results

        image_ids = [result["image_id"] for result in results if result.get("image_id")]

        try:
            docs = {
                doc["image_id"]: doc
                for doc in self._collection.find(
                    {"image_id": {"$in": image_ids}},
                    {"image_id": 1, "caption": 1, "cui": 1},
                )
            }
        except Exception:
            return results

        enriched_results = []
        for result in results:
            db_info = docs.get(result["image_id"])
            if db_info is None:
                enriched_results.append(result)
                continue

            enriched_results.append(
                {
                    "rank": result.get("rank", 0),
                    "image_id": result["image_id"],
                    "score": float(result.get("score", 0)),
                    "caption": db_info.get("caption", result.get("caption", "")),
                    "cui": db_info.get("cui", result.get("cui", "")),
                    "path": result.get("path", ""),
                }
            )

        return enriched_results
