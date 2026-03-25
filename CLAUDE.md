# MEDISCAN CBIR — Guide pour agents Claude

Système CBIR (Content-Based Image Retrieval) médical académique développé à Paris Cité.
Prototype non-clinique. Deux modes de recherche : **visual** (DINOv2) et **semantic** (BioMedCLIP).

---

## Périmètre actif

Le travail actuel porte sur le **cœur du système CBIR** :
- `src/mediscan/` — bibliothèque centrale
- `scripts/` — construction d'index, évaluation, CLI
- `tests/` — suite pytest
- `artifacts/` — index FAISS pré-construits (gérés via Git LFS)

**Hors périmètre actuel** : `backend/` (FastAPI) et `frontend/` (React/Vite).

---

## Architecture

```
src/mediscan/
├── process.py          # Configuration CPU (KMP_DUPLICATE_LIB_OK, OMP_NUM_THREADS=1)
├── runtime.py          # Hub de configuration : chemins, modes, factory d'embedders
├── dataset.py          # Chargement du CSV metadata → RocoDataset
├── search.py           # Pipeline de recherche principal (load_resources + query)
├── visual_similarity.py # Reranking visuel bas-niveau (uniquement mode visual)
└── embedders/
    ├── base.py         # Interface abstraite Embedder
    ├── utils.py        # Helpers PyTorch (normalisation, threads)
    ├── dinov2_base.py  # Embedder visuel (ViT DINOv2, 768-dim)
    ├── biomedclip.py   # Embedder sémantique (BioMedCLIP, 512-dim)
    └── factory.py      # Registre & factory des embedders

scripts/
├── build_index.py              # Construit un index FAISS depuis metadata.csv
├── query.py                    # CLI pour une requête unique
├── rebuild_stable_indexes.py   # Reconstruit visual + semantic en parallèle
└── evaluation/
    ├── evaluate_cui.py         # Métriques TQ1 / TQ2 (qualité CUI)
    ├── evaluate_typed.py       # Métriques par catégorie (TM, TA, TP)
    └── benchmark.py            # Métriques de performance (timing)
```

---

## Flux de données — Recherche

```
Image requête (fichier)
    → Embedder.encode_pil()          # vecteur float32 normalisé L2
    → faiss.normalize_L2()           # renormalisation de sécurité
    → index.search(k=search_k)       # produit intérieur sur IndexFlatIP
    → [mode visual] rerank_visual_results()   # reranking bas-niveau
    → [mode semantic] troncature à k résultats
    → liste de dicts {rank, score, image_id, path, caption, cui}
```

## Flux de données — Construction d'index

```
metadata.csv
    → RocoDataset             # itère les lignes (image_id, path, caption, cui)
    → Embedder.encode_pil()        # pour chaque image
    → np.vstack() + normalize_L2
    → faiss.IndexFlatIP.add()
    → artifacts/index.faiss + artifacts/ids.json
```

---

## Modes de recherche

| Mode       | Embedder      | Dim  | Index                        | Reranking visuel |
|------------|---------------|------|------------------------------|-----------------|
| `visual`   | `dinov2_base` | 768  | `artifacts/index.faiss`      | Oui (120 candidats → top-k) |
| `semantic` | `biomedclip`  | 512  | `artifacts/index_semantic.faiss` | Non (k+10 candidats) |

---

## Constantes clés

| Constante              | Valeur | Fichier               | Rôle |
|------------------------|--------|-----------------------|------|
| `MAX_K`                | 50     | search.py             | Limite max de résultats |
| `VISUAL_SHORTLIST_SIZE`| 120    | visual_similarity.py  | Candidats FAISS avant reranking visuel |
| `_SIGNATURE_SIZE`      | 96     | visual_similarity.py  | Résolution grayscale pour signature |
| `_COARSE_SIZE`         | 24     | visual_similarity.py  | Résolution silhouette grossière |
| `_FAISS_WEIGHT`        | 0.10   | visual_similarity.py  | Poids score FAISS dans reranking |
| `_PIXEL_WEIGHT`        | 0.40   | visual_similarity.py  | Poids similarité pixel |
| `_EDGE_WEIGHT`         | 0.20   | visual_similarity.py  | Poids similarité contours |
| `_COARSE_WEIGHT`       | 0.30   | visual_similarity.py  | Poids silhouette |

---

## Métriques d'évaluation

### TQ1 — Rappel par requête (évalue si au moins M CUI communs dans le top-k)
| Seuil M | Objectif |
|---------|---------|
| ≥ 1 CUI | ≥ 80% des requêtes |
| ≥ 2 CUI | ≥ 50% des requêtes |
| ≥ 3 CUI | ≥ 20% des requêtes |

### TQ2 — Précision par résultat (évalue chaque résultat individuel)
| Seuil M | Objectif |
|---------|---------|
| ≥ 1 CUI | ≥ 30% des résultats |
| ≥ 2 CUI | ≥ 12% des résultats |
| ≥ 3 CUI | ≥ 5% des résultats |

**Baseline connue (2026-03-22)** : les deux modes échouent TQ1 ≥ 2 CUI (visual 29%, semantic < 50%).

### Métriques typées (evaluate_typed.py)
TQ1/TQ2 calculés séparément par catégorie CUI : TM (modalité), TA (anatomie), TP (pathologie).

---

## Format des données

### metadata.csv
```csv
image_id,path,caption,cui
ROCOv2_2023_train_000010,data/roco_train_full/images/ROCOv2_2023_train_000010.png,"caption text","[""C0040405""]"
```

### ids.json (aligné avec l'index FAISS — même ordre, même taille)
```json
[{"image_id": "...", "path": "data/...", "caption": "...", "cui": "[\"C0040405\"]"}]
```

Le CUI est stocké comme **chaîne JSON** dans le CSV/JSON (ex: `"[\"C0040405\", \"C1234567\"]"`).
`parse_cui()` dans evaluate_cui.py fait le `json.loads()` pour récupérer un `set[str]`.

---

## Commandes utiles

```bash
# Environnement
make setup          # Crée .venv et installe les dépendances
source .venv/bin/activate

# Tests
pytest tests/       # Suite complète
pytest tests/test_search.py -v   # Module spécifique

# Recherche CLI
python scripts/query.py --mode visual --image data/roco_train_full/images/ROCOv2_2023_train_000010.png --k 5

# Évaluation qualité
python scripts/evaluation/evaluate_cui.py --mode visual --k 10 --n-queries 100

# Évaluation par catégorie
python scripts/evaluation/evaluate_typed.py --mode visual --k 10 --n-queries 100

# Construction d'index
python scripts/build_index.py --embedder dinov2_base --metadata data/roco_train_full/metadata.csv

# Reconstruire les index stables (parallèle visual + semantic)
python scripts/rebuild_stable_indexes.py
```

---

## Invariants critiques à respecter

1. **Alignement index/ids** : `len(ids.json) == index.ntotal` — toujours vérifier avec `load_resources()`.
2. **Normalisation L2 obligatoire** : tous les vecteurs doivent être normalisés avant insertion FAISS et avant requête (`faiss.normalize_L2()`). L'index est `IndexFlatIP` (produit intérieur = cosinus sur vecteurs normalisés).
3. **CPU uniquement** : pas de GPU. `OMP_NUM_THREADS=1`, `torch.set_num_threads(1)`, `faiss.omp_set_num_threads(1)`.
4. **Reranking uniquement en mode visual** : vérifier via `is_visual_embedder(name)` dans `runtime.py`.
5. **k ≤ 50** : `MAX_K = 50` — ne pas dépasser.
6. **search_k ≠ k** : FAISS reçoit `search_k` (120+ pour visual, k+10 pour semantic), le reranking/troncature produit les k résultats finaux.

---

## Dépendances principales

| Package         | Usage |
|-----------------|-------|
| `faiss-cpu`     | Index de similarité (IndexFlatIP) |
| `torch`         | Inférence DINOv2 et BioMedCLIP |
| `transformers`  | HuggingFace AutoModel pour DINOv2 |
| `open_clip_torch` | BioMedCLIP via OpenCLIP |
| `numpy`         | Matrices d'embeddings |
| `pillow`        | Chargement d'images (PIL.Image) |

---

## Structure des artifacts

```
artifacts/
├── index.faiss              # Index visual (DINOv2 768-dim, ~176k vecteurs)
├── ids.json                 # Métadonnées alignées avec index.faiss
├── index_semantic.faiss     # Index semantic (BioMedCLIP 512-dim)
├── ids_semantic.json        # Métadonnées alignées avec index_semantic.faiss
├── cui_categories.json      # Mapping CUI → catégorie (TM/TA/TP)
└── manifests/
    ├── visual_stable.json   # Hash commit + timestamp build visual
    └── semantic_stable.json # Hash commit + timestamp build semantic
```

Les artifacts FAISS sont versionnés avec **Git LFS**.
