"""Evaluation et comparaison des methodes d'agregation pour la selection multiple.

Trois methodes testees :
    - centroid  : moyenne des embeddings (methode actuelle)
    - weighted  : moyenne ponderee par les scores FAISS
    - max       : max pooling (valeur maximale par dimension)

Usage :
    python scripts/evaluation/evaluate_multi.py --mode visual --k 10 --n-queries 200 --seed 42 --n-select 3 --method centroid
    python scripts/evaluation/evaluate_multi.py --mode visual --k 10 --n-queries 200 --seed 42 --n-select 3 --method weighted
    python scripts/evaluation/evaluate_multi.py --mode visual --k 10 --n-queries 200 --seed 42 --n-select 3 --method max
    python scripts/evaluation/evaluate_multi.py --mode visual --k 10 --n-queries 200 --seed 42 --n-select 3 --method all
"""

from __future__ import annotations

import argparse
import csv
import os
import random
from datetime import datetime
from pathlib import Path

import faiss as faiss_lib
import numpy as np
from dotenv import load_dotenv
from PIL import Image
from pymongo import MongoClient

from mediscan.process import configure_cpu_environment
from mediscan.runtime import resolve_path
from mediscan.search import load_resources, query

load_dotenv()
configure_cpu_environment()

# ---------------------------------------------------------------------------
# Seuils
# ---------------------------------------------------------------------------
SEUILS = {
    "visual": {
        "TM_requetes_r1":    0.90,
        "TM_requetes_multi": 0.90,
        "TM_resultats_multi": 0.80,
        "TA_requetes_multi":  0.70,
        "TA_resultats_multi": 0.30,
        "TMO_requetes_multi": 0.60,
        "TMO_resultats_multi": 0.30,
    },
    "semantic": {
        "TM_requetes_r1":    0.80,
        "TM_requetes_multi": 0.80,
        "TM_resultats_multi": 0.65,
        "TA_requetes_multi":  0.60,
        "TA_resultats_multi": 0.35,
        "TMO_requetes_multi": 0.50,
        "TMO_resultats_multi": 0.35,
    },
}


# ---------------------------------------------------------------------------
# Chargement du ground truth depuis MongoDB
# ---------------------------------------------------------------------------

def load_ground_truth(mongo_uri: str) -> dict[str, dict]:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client['mediscan_db']
    gt: dict[str, dict] = {}
    for doc in db['results'].find({}, {"image_id": 1, "modalite": 1, "organe": 1, "mo": 1}):
        image_id = doc.get("image_id", "")
        if image_id:
            gt[image_id] = {
                "modalite": doc.get("modalite"),
                "organe":   doc.get("organe"),
                "mo":       doc.get("mo"),
            }
    print(f"Ground truth charge : {len(gt)} images")
    return gt


# ---------------------------------------------------------------------------
# Selection des requetes initiales
# ---------------------------------------------------------------------------

def pick_query_rows(
    rows: list[dict],
    gt: dict[str, dict],
    n: int,
    seed: int,
) -> list[dict]:
    evaluable = [r for r in rows if r.get("image_id", "") in gt]
    if n > len(evaluable):
        print(f"[WARN] Demande {n} requetes mais seulement {len(evaluable)} exploitables.")
        n = len(evaluable)
    return random.Random(seed).sample(evaluable, n)


# ---------------------------------------------------------------------------
# Comparaison avec le ground truth
# ---------------------------------------------------------------------------

def compare_with_gt(
    query_id: str,
    results: list[dict],
    gt: dict[str, dict],
) -> dict:
    gt_query       = gt.get(query_id, {})
    modalite_query = gt_query.get("modalite")
    organe_query   = gt_query.get("organe")
    mo_query       = gt_query.get("mo")

    hit_modalite = False
    hit_organe   = False
    hit_mo       = False
    details      = []

    for result in results:
        result_id       = result.get("image_id", "")
        gt_result       = gt.get(result_id, {})
        modalite_result = gt_result.get("modalite")
        organe_result   = gt_result.get("organe")
        mo_result       = gt_result.get("mo")

        match_m  = bool(modalite_query and modalite_result and modalite_query == modalite_result)
        match_a  = bool(organe_query   and organe_result   and organe_query   == organe_result)
        match_mo = bool(mo_query       and mo_result       and mo_query       == mo_result)

        if match_m:  hit_modalite = True
        if match_a:  hit_organe   = True
        if match_mo: hit_mo       = True

        details.append({
            "result_id":        result_id,
            "score_faiss":      result["score"],
            "match_modalite":   int(match_m),
            "match_organe":     int(match_a),
            "match_mo":         int(match_mo),
            "query_has_organe": int(bool(organe_query)),
            "query_has_mo":     int(bool(mo_query)),
        })

    tm_resultats = sum(d["match_modalite"] for d in details) / len(details) if details else 0.0

    return {
        "hit_modalite":  hit_modalite,
        "hit_organe":    hit_organe,
        "hit_mo":        hit_mo,
        "tm_resultats":  tm_resultats,
        "details":       details,
    }


# ---------------------------------------------------------------------------
# Methodes d'agregation
# ---------------------------------------------------------------------------

def aggregate_embeddings(
    embeddings: list[np.ndarray],
    scores: list[float],
    method: str,
) -> np.ndarray:
    """Agregation des embeddings selon la methode choisie."""
    emb_matrix = np.array(embeddings, dtype=np.float32)

    if method == "centroid":
        vector = np.mean(emb_matrix, axis=0)

    elif method == "weighted":
        # Moyenne ponderee par les scores FAISS
        scores_arr = np.array(scores, dtype=np.float32)
        scores_arr = np.maximum(scores_arr, 0)  # scores negatifs -> 0
        total = scores_arr.sum()
        if total == 0:
            vector = np.mean(emb_matrix, axis=0)
        else:
            weights = scores_arr / total
            vector = np.average(emb_matrix, axis=0, weights=weights)

    elif method == "max":
        # Max pooling : valeur maximale par dimension
        vector = np.max(emb_matrix, axis=0)

    else:
        raise ValueError(f"Methode inconnue : {method}")

    vector = vector.reshape(1, -1).astype(np.float32)
    faiss_lib.normalize_L2(vector)
    return vector


def search_by_vector(
    vector: np.ndarray,
    resources,
    k: int,
    excluded_ids: set[str],
) -> list[dict]:
    """Lance une recherche FAISS avec un vecteur et exclut les images selectionnees."""
    search_k = min(k + len(excluded_ids), resources.index.ntotal)
    scores, indices = resources.index.search(vector, search_k)

    results = []
    for idx, score in zip(indices[0], scores[0]):
        if idx < 0:
            continue
        row      = resources.rows[idx]
        image_id = str(row.get("image_id", ""))
        if image_id in excluded_ids:
            continue
        results.append({
            "rank":     len(results) + 1,
            "score":    float(score),
            "image_id": image_id,
            "path":     str(row.get("path", "")),
            "caption":  str(row.get("caption", "")),
            "cui":      str(row.get("cui", "")),
        })
        if len(results) >= k:
            break

    return results


# ---------------------------------------------------------------------------
# Evaluation principale
# ---------------------------------------------------------------------------

def evaluate(
    query_rows: list[dict],
    resources,
    k: int,
    gt: dict[str, dict],
    n_select: int,
    methods: list[str],
) -> tuple[list[dict], dict[str, list[dict]]]:
    all_query_results: list[dict] = []
    all_result_details: dict[str, list[dict]] = {m: [] for m in methods}
    images_manquantes    = 0
    agregation_impossible = 0

    for i, query_row in enumerate(query_rows, start=1):
        image_path = resolve_path(str(query_row.get("path", "")))
        if not image_path.exists():
            images_manquantes += 1
            continue

        query_id = query_row.get("image_id", "")
        gt_query = gt.get(query_id, {})

        # Recherche initiale
        results_r1 = query(resources=resources, image=image_path, k=k, exclude_self=True)
        if not results_r1:
            agregation_impossible += 1
            continue

        cmp_r1 = compare_with_gt(query_id, results_r1, gt)

        # Encode les N meilleurs resultats disponibles localement
        selected_embeddings = []
        selected_scores     = []
        selected_ids        = set()

        for r in results_r1[:n_select]:
            p = resolve_path(str(r.get("path", "")))
            if not p.exists():
                continue
            try:
                with Image.open(p) as pil_image:
                    emb = resources.embedder.encode_pil(pil_image)
                    selected_embeddings.append(emb)
                    selected_scores.append(r["score"])
                    selected_ids.add(r.get("image_id", ""))
            except Exception:
                continue

        if len(selected_embeddings) < 2:
            agregation_impossible += 1
            continue

        query_result = {
            "query_id":        query_id,
            "modalite_query":  gt_query.get("modalite"),
            "organe_query":    gt_query.get("organe"),
            "mo_query":        gt_query.get("mo"),
            "n_selected":      len(selected_embeddings),
            "hit_modalite_r1": int(cmp_r1["hit_modalite"]),
            "hit_organe_r1":   int(cmp_r1["hit_organe"]),
            "hit_mo_r1":       int(cmp_r1["hit_mo"]),
            "tm_resultats_r1": cmp_r1["tm_resultats"],
            "has_organe":      int(bool(gt_query.get("organe"))),
            "has_mo":          int(bool(gt_query.get("mo"))),
        }

        # Teste chaque methode d'agregation
        for method in methods:
            vector  = aggregate_embeddings(selected_embeddings, selected_scores, method)
            results = search_by_vector(vector, resources, k, selected_ids)
            cmp     = compare_with_gt(query_id, results, gt)

            query_result[f"hit_modalite_{method}"] = int(cmp["hit_modalite"])
            query_result[f"hit_organe_{method}"]   = int(cmp["hit_organe"])
            query_result[f"hit_mo_{method}"]       = int(cmp["hit_mo"])
            query_result[f"tm_resultats_{method}"] = cmp["tm_resultats"]

            for d in cmp["details"]:
                d["query_id"] = query_id
                d["method"]   = method
                all_result_details[method].append(d)

        all_query_results.append(query_result)

        if i % 20 == 0:
            print(f"  Evalue {i}/{len(query_rows)} requetes...")

    if images_manquantes > 0:
        print(f"[WARN] {images_manquantes} images initiales introuvables.")
    if agregation_impossible > 0:
        print(f"[WARN] {agregation_impossible} agregations impossibles.")

    return all_query_results, all_result_details


# ---------------------------------------------------------------------------
# Calcul des metriques par methode
# ---------------------------------------------------------------------------

def compute_metrics_for_method(
    query_results: list[dict],
    result_details: list[dict],
    method: str,
) -> dict[str, float | None]:
    total_q = len(query_results)
    total_r = len(result_details)

    if total_q == 0:
        return {}

    q_avec_organe = [r for r in query_results if r["has_organe"]]
    q_avec_mo     = [r for r in query_results if r["has_mo"]]
    r_avec_organe = [r for r in result_details if r["query_has_organe"]]
    r_avec_mo     = [r for r in result_details if r["query_has_mo"]]

    return {
        "TM_requetes_r1":     sum(r["hit_modalite_r1"] for r in query_results) / total_q,
        "TM_requetes_multi":  sum(r[f"hit_modalite_{method}"] for r in query_results) / total_q,
        "TM_resultats_multi": sum(r["match_modalite"] for r in result_details) / total_r if total_r else 0.0,
        "TA_requetes_multi":  (
            sum(r[f"hit_organe_{method}"] for r in q_avec_organe) / len(q_avec_organe)
            if q_avec_organe else None
        ),
        "TA_resultats_multi": (
            sum(r["match_organe"] for r in r_avec_organe) / len(r_avec_organe)
            if r_avec_organe else None
        ),
        "TMO_requetes_multi": (
            sum(r[f"hit_mo_{method}"] for r in q_avec_mo) / len(q_avec_mo)
            if q_avec_mo else None
        ),
        "TMO_resultats_multi": (
            sum(r["match_mo"] for r in r_avec_mo) / len(r_avec_mo)
            if r_avec_mo else None
        ),
        "n_queries_total":       total_q,
        "n_queries_avec_organe": len(q_avec_organe),
        "n_queries_avec_mo":     len(q_avec_mo),
        "n_results_total":       total_r,
    }


# ---------------------------------------------------------------------------
# Affichage comparatif
# ---------------------------------------------------------------------------

def print_comparison(
    metrics_by_method: dict[str, dict],
    mode: str,
    k: int,
    seed: int,
    n_select: int,
) -> None:
    print(f"\n{'='*65}")
    print(f"  COMPARAISON METHODES -- mode={mode}  k={k}  seed={seed}  n_select={n_select}")
    print(f"{'='*65}")

    first = list(metrics_by_method.values())[0]
    print(f"  Requetes evaluees : {first.get('n_queries_total')}")
    print(f"  Baseline R1 TM    : {first.get('TM_requetes_r1', 0):.1%}")

    print(f"\n  {'Metrique':<25} ", end="")
    for method in metrics_by_method:
        print(f"{method:>12}", end="")
    print()
    print(f"  {'-'*25} ", end="")
    for _ in metrics_by_method:
        print(f"{'':->12}", end="")
    print()

    metriques = [
        ("TM_requetes_multi",  "TM requetes"),
        ("TM_resultats_multi", "TM resultats"),
        ("TA_requetes_multi",  "TA requetes"),
        ("TA_resultats_multi", "TA resultats"),
        ("TMO_requetes_multi", "TMO requetes"),
        ("TMO_resultats_multi","TMO resultats"),
    ]

    for key, label in metriques:
        print(f"  {label:<25} ", end="")
        vals = []
        for method, metrics in metrics_by_method.items():
            val = metrics.get(key)
            if val is None:
                print(f"{'N/A':>12}", end="")
            else:
                vals.append(val)
                print(f"{val:.1%}".rjust(12), end="")
        # Indique la meilleure methode
        if vals and len(vals) == len(metrics_by_method):
            best_idx = vals.index(max(vals))
            best_method = list(metrics_by_method.keys())[best_idx]
            print(f"  <- {best_method}", end="")
        print()

    print()

    # Detail PASS/FAIL pour chaque methode
    seuils = SEUILS[mode]
    for method, metrics in metrics_by_method.items():
        print(f"\n  --- {method.upper()} ---")
        for key, label in metriques:
            val   = metrics.get(key)
            seuil = seuils.get(key)
            if val is None or seuil is None:
                continue
            status = "PASS" if val >= seuil else "FAIL"
            print(f"    {key:25s}: {val:.1%}  (seuil >= {seuil:.0%})  {status}")


# ---------------------------------------------------------------------------
# Sauvegarde CSV
# ---------------------------------------------------------------------------

def save_csv(
    metrics_by_method: dict[str, dict],
    query_results: list[dict],
    output_dir: Path,
    mode: str,
    k: int,
    seed: int,
    n_select: int,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = output_dir / f"eval_multi_compare_{mode}_seed{seed}_{timestamp}.csv"

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["# MEDISCAN AI -- Comparaison methodes agregation"])
        w.writerow(["# mode", mode])
        w.writerow(["# k", k])
        w.writerow(["# seed", seed])
        w.writerow(["# n_select", n_select])
        w.writerow([])
        w.writerow(["methode", "TM_req", "TM_res", "TA_req", "TA_res", "TMO_req", "TMO_res"])
        for method, metrics in metrics_by_method.items():
            w.writerow([
                method,
                f"{metrics.get('TM_requetes_multi', 0):.4f}",
                f"{metrics.get('TM_resultats_multi', 0):.4f}",
                f"{metrics['TA_requetes_multi']:.4f}" if metrics.get('TA_requetes_multi') else "N/A",
                f"{metrics['TA_resultats_multi']:.4f}" if metrics.get('TA_resultats_multi') else "N/A",
                f"{metrics['TMO_requetes_multi']:.4f}" if metrics.get('TMO_requetes_multi') else "N/A",
                f"{metrics['TMO_resultats_multi']:.4f}" if metrics.get('TMO_resultats_multi') else "N/A",
            ])
        w.writerow([])
        w.writerow(["--- DETAILS PAR REQUETE ---"])
        if query_results:
            w.writerow(list(query_results[0].keys()))
            for row in query_results:
                w.writerow(list(row.values()))

    return csv_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Comparaison methodes agregation pour selection multiple"
    )
    parser.add_argument("--mode",       default="visual", choices=("visual", "semantic"))
    parser.add_argument("--k",          type=int, default=10)
    parser.add_argument("--n-queries",  type=int, default=200)
    parser.add_argument("--seed",       type=int, default=42)
    parser.add_argument("--n-select",   type=int, default=3)
    parser.add_argument("--method",     default="all",
                        choices=("centroid", "weighted", "max", "all"))
    parser.add_argument("--output-dir", default="proofs/perf")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI non defini dans .env")

    methods = ["centroid", "weighted", "max"] if args.method == "all" else [args.method]

    gt = load_ground_truth(mongo_uri)

    resources = load_resources(mode=args.mode)
    print(f"Index charge : {resources.index.ntotal} vecteurs, dim={resources.index.d}")

    query_rows = pick_query_rows(resources.rows, gt, args.n_queries, args.seed)
    print(f"mode={args.mode}  k={args.k}  n_queries={len(query_rows)}  seed={args.seed}  n_select={args.n_select}  methods={methods}")

    query_results, all_result_details = evaluate(
        query_rows, resources, args.k, gt, args.n_select, methods
    )

    metrics_by_method = {}
    for method in methods:
        metrics_by_method[method] = compute_metrics_for_method(
            query_results, all_result_details[method], method
        )

    print_comparison(metrics_by_method, args.mode, args.k, args.seed, args.n_select)

    csv_path = save_csv(
        metrics_by_method, query_results,
        resolve_path(args.output_dir),
        args.mode, args.k, args.seed, args.n_select,
    )
    print(f"Resultats sauvegardes : {csv_path}")


if __name__ == "__main__":
    main()