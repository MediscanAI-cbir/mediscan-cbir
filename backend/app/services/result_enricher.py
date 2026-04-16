"""
Enrichissement optionnel des résultats de recherche avec les métadonnées MongoDB.

Ce module complète les résultats bruts du pipeline FAISS (qui ne contiennent que
rank, image_id et score) avec les métadonnées textuelles stockées dans MongoDB
(caption, CUI — identifiant de concept médical UMLS).
La connexion MongoDB est optionnelle : si elle échoue, les résultats bruts sont retournés.
"""

from __future__ import annotations

from typing import Any

from backend.app.config import COLLECTION_NAME, DB_NAME, MONGO_URI


def _load_mongo_collection():
    """
    Tente de se connecter à MongoDB et retourne la collection Mediscan.

    Returns:
        La collection PyMongo si la connexion réussit, None sinon.
        Retourne None si MONGO_URI n'est pas défini ou si la connexion échoue.
    """
    if not MONGO_URI:
        return None

    try:
        from pymongo import MongoClient

        return MongoClient(MONGO_URI)[DB_NAME][COLLECTION_NAME]
    except Exception:
        return None


class MongoResultEnricher:
    """
    Couche d'enrichissement optionnelle des résultats de recherche via MongoDB.

    Récupère en batch les métadonnées (caption, CUI) depuis MongoDB pour
    compléter les résultats FAISS, qui ne contiennent que les informations
    d'index brutes. Si MongoDB est indisponible, les résultats originaux
    sont retournés sans modification.
    """

    def __init__(self, collection=None) -> None:
        """
        Initialise l'enrichisseur avec une collection MongoDB.

        Args:
            collection: La collection PyMongo à utiliser, ou None si MongoDB
                        n'est pas configuré ou indisponible.
        """
        self._collection = collection

    @classmethod
    def from_environment(cls) -> "MongoResultEnricher":
        """
        Crée un enrichisseur en lisant la configuration depuis les variables d'environnement.

        Returns:
            Une instance de MongoResultEnricher, avec ou sans connexion MongoDB active.
        """
        return cls(collection=_load_mongo_collection())

    def enrich(self, results: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        Enrichit une liste de résultats de recherche avec les métadonnées MongoDB.

        Récupère les documents correspondants en une seule requête batch ($in)
        et fusionne les champs caption et CUI dans chaque résultat.

        Args:
            results: Liste de résultats bruts du pipeline FAISS (rank, image_id, score, path).

        Returns:
            La liste enrichie avec caption et CUI depuis MongoDB, ou la liste originale
            si MongoDB est indisponible ou si la requête échoue.
        """
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
