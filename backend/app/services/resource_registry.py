"""
Registre thread-safe des ressources de recherche chargées à la demande.

Ce module fournit un cache partagé pour les index FAISS et les embedders,
chargés une seule fois par mode (visual/semantic) et réutilisés pour toutes
les requêtes suivantes sans rechargement.
"""

from __future__ import annotations

from threading import Lock

from mediscan.search import SearchResources, load_resources


class SearchResourceRegistry:
    """
    Cache thread-safe pour le chargement à la demande des ressources de recherche.

    Les ressources (index FAISS + embedder) sont coûteuses à charger.
    Ce registre garantit qu'elles ne sont chargées qu'une seule fois par mode,
    même sous charge concurrente, grâce à un verrou de double vérification.
    """

    def __init__(self, resources: dict[str, SearchResources] | None = None) -> None:
        """
        Initialise le registre, optionnellement avec des ressources pré-chargées.

        Args:
            resources: Dictionnaire optionnel de ressources déjà disponibles,
                       indexées par mode ('visual', 'semantic').
        """
        self._resources = dict(resources or {})
        self._lock = Lock()

    def get_or_load(self, mode: str) -> SearchResources:
        """
        Retourne les ressources pour un mode donné, en les chargeant si nécessaire.

        Utilise le pattern de double vérification (double-checked locking) pour
        éviter les chargements multiples sous concurrence tout en minimisant
        le temps passé sous le verrou.

        Args:
            mode: Le mode de recherche ('visual' ou 'semantic').

        Returns:
            Les ressources de recherche (index FAISS + embedder) pour ce mode.
        """
        resources = self._resources.get(mode)
        if resources is not None:
            return resources

        with self._lock:
            resources = self._resources.get(mode)
            if resources is not None:
                return resources

            resources = load_resources(mode=mode)
            self._resources[mode] = resources
            return resources
