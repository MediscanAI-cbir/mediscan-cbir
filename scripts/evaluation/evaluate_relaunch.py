"""Evaluation de la fonctionnalite de relance depuis un resultat.

Simule N relances successives depuis le meilleur resultat :
    R1 : recherche initiale depuis l'image originale
    R2 : relance depuis rank-1 de R1
    R3 : relance depuis rank-1 de R2
    ...

Permet de mesurer la derive (drift) eventuelle apres plusieurs relances.

Usage :
    python scripts/evaluation/evaluate_relaunch.py --mode visual --k 10 --n-queries 200 --seed 42 --n-relaunch 3
    python scripts/evaluation/evaluate_relaunch.py --mode semantic --k 10 --n-queries 200 --seed 123 --n-relaunch 3
"""

from __future__ import annotations

import argparse
import csv
import os
import random
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

from mediscan.process import configure_cpu_environment
from mediscan.runtime import resolve_path
from mediscan.search import load_resources, query

load_dotenv()
configure_cpu_environment()

# ---------------------------------------------------------------------------
# Seuils par mode (appliques a chaque etape de relance)
# ---------------------------------------------------------------------------
SEUILS = {
    "visual": {
        "TM_requetes":   0.90,
        "TM_resultats":  0.80,
        "TA_requetes":   0.70,
        "TA_resultats":  0.30,
        "TMO_requetes":  0.60,
        "TMO_resultats": 0.35,
    },
    "semantic": {
        "TM_requetes":   0.80,
        "TM_resultats":  0.65,
        "TA_requetes":   0.60,
        "TA_resultats":  0.35,
        "TMO_requetes":  0.50,
        "TMO_resultats": 0.35,
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
        "hit_modalite": hit_modalite,
        "hit_organe":   hit_organe,
        "hit_mo":       hit_mo,
        "tm_resultats": tm_resultats,
        "details":      details,
    }


# ---------------------------------------------------------------------------
# Evaluation principale avec N relances
# ---------------------------------------------------------------------------

def evaluate(
    query_rows: list[dict],
    resources,
    k: int,
    gt: dict[str, dict],
    n_relaunch: int,
) -> tuple[list[dict], list[dict]]:
    """
    Pour chaque requete initiale, effectue n_relaunch relances successives.
    Retourne les metriques a chaque etape.
    """
    all_query_results: list[dict] = []
    all_result_details: list[dict] = []
    images_manquantes    = 0
    relances_impossibles = 0

    for i, query_row in enumerate(query_rows, start=1):
        image_path = resolve_path(str(query_row.get("path", "")))
        if not image_path.exists():
            images_manquantes += 1
            continue

        query_id  = query_row.get("image_id", "")
        gt_query  = gt.get(query_id, {})

        query_result = {
            "query_id":       query_id,
            "modalite_query": gt_query.get("modalite"),
            "organe_query":   gt_query.get("organe"),
            "mo_query":       gt_query.get("mo"),
            "has_organe":     int(bool(gt_query.get("organe"))),
            "has_mo":         int(bool(gt_query.get("mo"))),
        }

        current_path = image_path
        current_id   = query_id
        failed       = False

        for step in range(n_relaunch + 1):
            label = "R1" if step == 0 else f"R{step + 1}"

            results = query(resources=resources, image=current_path, k=k, exclude_self=True)
            cmp     = compare_with_gt(query_id, results, gt)

            query_result[f"hit_modalite_{label}"] = int(cmp["hit_modalite"])
            query_result[f"hit_organe_{label}"]   = int(cmp["hit_organe"])
            query_result[f"hit_mo_{label}"]       = int(cmp["hit_mo"])
            query_result[f"tm_resultats_{label}"] = cmp["tm_resultats"]

            if step == n_relaunch:
                for d in cmp["details"]:
                    d["query_id"]     = query_id
                    d["relaunch_step"] = label
                    all_result_details.append(d)
                break

            # Prepare la prochaine relance depuis rank-1
            if not results:
                relances_impossibles += 1
                failed = True
                break

            best     = results[0]
            best_path = resolve_path(str(best.get("path", "")))
            if not best_path.exists():
                relances_impossibles += 1
                failed = True
                break

            current_path = best_path
            current_id   = best.get("image_id", "")

        if not failed:
            all_query_results.append(query_result)

        if i % 20 == 0:
            print(f"  Evalue {i}/{len(query_rows)} requetes...")

    if images_manquantes > 0:
        print(f"[WARN] {images_manquantes} images initiales introuvables.")
    if relances_impossibles > 0:
        print(f"[WARN] {relances_impossibles} relances impossibles (image rank-1 introuvable).")

    return all_query_results, all_result_details


# ---------------------------------------------------------------------------
# Calcul des metriques par etape
# ---------------------------------------------------------------------------

def compute_metrics(
    query_results: list[dict],
    n_relaunch: int,
) -> dict[str, dict]:
    """Calcule les metriques pour chaque etape R1, R2, ... RN+1."""
    metrics_by_step = {}
    total_q = len(query_results)

    if total_q == 0:
        return {}

    q_avec_organe = [r for r in query_results if r["has_organe"]]
    q_avec_mo     = [r for r in query_results if r["has_mo"]]

    for step in range(n_relaunch + 1):
        label = "R1" if step == 0 else f"R{step + 1}"

        tm_requetes = sum(r.get(f"hit_modalite_{label}", 0) for r in query_results) / total_q
        tm_resultats = sum(r.get(f"tm_resultats_{label}", 0) for r in query_results) / total_q

        ta_requetes = (
            sum(r.get(f"hit_organe_{label}", 0) for r in q_avec_organe) / len(q_avec_organe)
            if q_avec_organe else None
        )
        tmo_requetes = (
            sum(r.get(f"hit_mo_{label}", 0) for r in q_avec_mo) / len(q_avec_mo)
            if q_avec_mo else None
        )

        metrics_by_step[label] = {
            "TM_requetes":           tm_requetes,
            "TM_resultats":          tm_resultats,
            "TA_requetes":           ta_requetes,
            "TMO_requetes":          tmo_requetes,
            "n_queries_total":       total_q,
            "n_queries_avec_organe": len(q_avec_organe),
            "n_queries_avec_mo":     len(q_avec_mo),
        }

    return metrics_by_step


# ---------------------------------------------------------------------------
# Affichage
# ---------------------------------------------------------------------------

def print_results(metrics_by_step: dict, mode: str, k: int, seed: int, n_relaunch: int) -> None:
    seuils = SEUILS[mode]

    print(f"\n{'='*60}")
    print(f"  EVALUATION RELANCE x{n_relaunch} -- mode={mode}  k={k}  seed={seed}")
    print(f"{'='*60}")

    first_step = list(metrics_by_step.values())[0]
    print(f"  Requetes evaluees : {first_step.get('n_queries_total')}")

    print(f"\n  {'Etape':<8} {'TM_req':>8} {'TM_res':>8} {'TA_req':>8} {'TMO_req':>8}")
    print(f"  {'-'*44}")

    for label, metrics in metrics_by_step.items():
        tm_req  = f"{metrics['TM_requetes']:.1%}"
        tm_res  = f"{metrics['TM_resultats']:.1%}"
        ta_req  = f"{metrics['TA_requetes']:.1%}" if metrics['TA_requetes'] is not None else "N/A"
        tmo_req = f"{metrics['TMO_requetes']:.1%}" if metrics['TMO_requetes'] is not None else "N/A"
        print(f"  {label:<8} {tm_req:>8} {tm_res:>8} {ta_req:>8} {tmo_req:>8}")

    print(f"\n  --- Detail de la derniere etape ---")
    last_label   = list(metrics_by_step.keys())[-1]
    last_metrics = metrics_by_step[last_label]
    _print_metric("TM_requetes",  last_metrics, seuils, "requetes trouvant meme modalite")
    _print_metric("TM_resultats", last_metrics, seuils, "resultats de meme modalite")

    n_a = last_metrics.get("n_queries_avec_organe", 0)
    print(f"\n  TA (base : {n_a} requetes avec organe)")
    _print_metric("TA_requetes", last_metrics, seuils, "requetes trouvant meme organe")

    n_mo = last_metrics.get("n_queries_avec_mo", 0)
    print(f"\n  TMO (base : {n_mo} requetes)")
    _print_metric("TMO_requetes", last_metrics, seuils, "requetes trouvant meme modalite+organe")

    print()


def _print_metric(key: str, metrics: dict, seuils: dict, label: str) -> None:
    val = metrics.get(key)
    if val is None:
        print(f"    {key:22s}: N/A  (aucune requete eligible)")
        return
    seuil = seuils.get(key)
    if seuil is None:
        print(f"    {key:22s}: {val:.1%}  -- {label}")
        return
    status = "PASS" if val >= seuil else "FAIL"
    print(f"    {key:22s}: {val:.1%}  (seuil >= {seuil:.0%})  {status}  -- {label}")


# ---------------------------------------------------------------------------
# Sauvegarde CSV
# ---------------------------------------------------------------------------

def save_csv(
    metrics_by_step: dict,
    query_results: list[dict],
    result_details: list[dict],
    output_dir: Path,
    mode: str,
    k: int,
    seed: int,
    n_relaunch: int,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = output_dir / f"eval_relaunch{n_relaunch}_{mode}_seed{seed}_{timestamp}.csv"

    seuils = SEUILS[mode]

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["# MEDISCAN AI -- Evaluation relance multiple"])
        w.writerow(["# mode", mode])
        w.writerow(["# k", k])
        w.writerow(["# seed", seed])
        w.writerow(["# n_relaunch", n_relaunch])
        w.writerow([])
        w.writerow(["etape", "TM_requetes", "TM_resultats", "TA_requetes", "TMO_requetes"])
        for label, metrics in metrics_by_step.items():
            w.writerow([
                label,
                f"{metrics['TM_requetes']:.4f}",
                f"{metrics['TM_resultats']:.4f}",
                f"{metrics['TA_requetes']:.4f}" if metrics['TA_requetes'] is not None else "N/A",
                f"{metrics['TMO_requetes']:.4f}" if metrics['TMO_requetes'] is not None else "N/A",
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
        description="Evaluation relance multiple depuis un resultat"
    )
    parser.add_argument("--mode",        default="visual", choices=("visual", "semantic"))
    parser.add_argument("--k",           type=int, default=10)
    parser.add_argument("--n-queries",   type=int, default=200)
    parser.add_argument("--seed",        type=int, default=42)
    parser.add_argument("--n-relaunch",  type=int, default=3, help="Nombre de relances successives")
    parser.add_argument("--output-dir",  default="proofs/perf")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI non defini dans .env")

    gt = load_ground_truth(mongo_uri)

    resources = load_resources(mode=args.mode)
    print(f"Index charge : {resources.index.ntotal} vecteurs, dim={resources.index.d}")

    query_rows = pick_query_rows(resources.rows, gt, args.n_queries, args.seed)
    print(f"mode={args.mode}  k={args.k}  n_queries={len(query_rows)}  seed={args.seed}  n_relaunch={args.n_relaunch}")

    query_results, result_details = evaluate(
        query_rows, resources, args.k, gt, args.n_relaunch
    )
    metrics_by_step = compute_metrics(query_results, args.n_relaunch)
    print_results(metrics_by_step, args.mode, args.k, args.seed, args.n_relaunch)

    csv_path = save_csv(
        metrics_by_step, query_results, result_details,
        resolve_path(args.output_dir),
        args.mode, args.k, args.seed, args.n_relaunch,
    )
    print(f"Resultats sauvegardes : {csv_path}")


if __name__ == "__main__":
    main()