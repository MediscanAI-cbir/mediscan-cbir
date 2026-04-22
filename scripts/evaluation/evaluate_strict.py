"""Evaluation STRICTE — sans biais d'annotation manquante.

Filtre :
1. Les requêtes : seules les images annotées dans les 3 CSV (modalite, organe, mo)
2. Les résultats : seuls les résultats annotés dans les 3 CSV sont comptés

Cela élimine le biais où des résultats corrects mais non annotés
sont comptés comme "miss" et tirent la métrique vers le bas.

Usage :
    PYTHONPATH=src python scripts/evaluation/evaluate_strict.py --mode semantic --k 10 --n-queries 2000 --seed 42
    PYTHONPATH=src python scripts/evaluation/evaluate_strict.py --mode visual   --k 10 --n-queries 2000 --seed 42

Note :
    Cette evaluation s'appuie sur les vecteurs deja presents dans l'index FAISS
    via ``query_from_index``. Les fichiers image de requete ne sont donc pas
    necessaires localement pour lancer l'evaluation.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import random
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from mediscan.process import configure_cpu_environment
from mediscan.runtime import resolve_path
from mediscan.search import load_resources, query_from_index

load_dotenv()
configure_cpu_environment()

GT_MODALITY_CSV = Path("artifacts/ground_truth/ROCOv2_GLOABL_modality.csv")
GT_ORGAN_CSV    = Path("artifacts/ground_truth/ROCOv2_GLOABL_organ.csv")
GT_MO_CSV       = Path("artifacts/ground_truth/ROCOv2_GLOABL_mo.csv")


def load_ground_truth_from_csv(modality_csv, organ_csv, mo_csv):
    gt: dict[str, dict] = {}

    def read_csv(path, key):
        if not path.exists():
            print(f"[WARN] CSV introuvable : {path}")
            return
        with path.open(encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                img = row.get("img", "").strip()
                label = row.get("label", "").strip()
                if not img or not label:
                    continue
                image_id = Path(img).stem
                if image_id not in gt:
                    gt[image_id] = {"modalite": None, "organe": None, "mo": None}
                gt[image_id][key] = label

    read_csv(modality_csv, "modalite")
    read_csv(organ_csv,    "organe")
    read_csv(mo_csv,       "mo")
    return gt


def evaluate_strict(query_rows, resources, k, gt_full, gt_strict, mode):
    """
    gt_full   : ground truth complet (pour identifier les requêtes)
    gt_strict : ground truth filtré (uniquement les images avec les 3 annotations)
    """
    query_results = []
    result_details = []
    query_ids_absents = 0
    paths_absents = 0

    total_queries = len(query_rows)

    for i, query_row in enumerate(query_rows, start=1):
        if i == 1 or i % 25 == 0 or i == total_queries:
            print(f"[progress] {i}/{total_queries} images", flush=True)

        query_id       = query_row.get("image_id", "")
        if query_id not in resources.row_index_by_image_id:
            query_ids_absents += 1
            continue

        query_path_raw = str(query_row.get("path", "")).strip()
        if query_path_raw:
            image_path = resolve_path(query_path_raw)
            if not image_path.exists():
                paths_absents += 1

        gt_query       = gt_strict[query_id]  # garanti d'avoir les 3 annotations
        modalite_query = gt_query["modalite"]
        organe_query   = gt_query["organe"]
        mo_query       = gt_query["mo"]

        results = query_from_index(resources=resources, image_id=query_id, k=k, exclude_self=True)

        hit_modalite = False
        hit_organe   = False
        hit_mo       = False

        for result in results:
            result_id = result.get("image_id", "")

            # FILTRE STRICT : on ne considère que les résultats avec les 3 annotations
            if result_id not in gt_strict:
                continue

            gt_result       = gt_strict[result_id]
            modalite_result = gt_result["modalite"]
            organe_result   = gt_result["organe"]
            mo_result       = gt_result["mo"]

            match_m  = modalite_query == modalite_result
            match_a  = organe_query   == organe_result
            match_mo = mo_query       == mo_result

            if match_m:  hit_modalite = True
            if match_a:  hit_organe   = True
            if match_mo: hit_mo       = True

            result_details.append({
                "query_id":       query_id,
                "result_id":      result_id,
                "match_modalite": int(match_m),
                "match_organe":   int(match_a),
                "match_mo":       int(match_mo),
            })

        query_results.append({
            "query_id":     query_id,
            "hit_modalite": int(hit_modalite),
            "hit_organe":   int(hit_organe),
            "hit_mo":       int(hit_mo),
            "n_results_evalues": sum(1 for r in results if r.get("image_id") in gt_strict),
            "n_results_total":   len(results),
        })

        if i % 50 == 0:
            print(f"  Evalue {i}/{len(query_rows)} requetes...")

    if query_ids_absents > 0:
        print(
            f"[WARN] {query_ids_absents} query_ids absents de l'index ont ete ignores "
            f"sur {len(query_rows)} requetes."
        )
    if paths_absents > 0:
        print(
            f"[WARN] {paths_absents} chemins image manquants detectes, "
            "mais l'evaluation a continue via les vecteurs deja presents dans l'index."
        )

    return query_results, result_details


def compute_metrics_strict(query_results, result_details):
    total_q = len(query_results)
    total_r = len(result_details)

    if total_q == 0 or total_r == 0:
        return {}

    return {
        "TM_requetes":   sum(r["hit_modalite"] for r in query_results) / total_q,
        "TM_resultats":  sum(r["match_modalite"] for r in result_details) / total_r,
        "TA_requetes":   sum(r["hit_organe"]  for r in query_results) / total_q,
        "TA_resultats":  sum(r["match_organe"]  for r in result_details) / total_r,
        "TMO_requetes":  sum(r["hit_mo"]      for r in query_results) / total_q,
        "TMO_resultats": sum(r["match_mo"]      for r in result_details) / total_r,
        "n_queries_total":     total_q,
        "n_results_evalues":   total_r,
        "results_par_requete": total_r / total_q if total_q else 0,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["visual", "semantic"], required=True)
    parser.add_argument("--k", type=int, default=10)
    parser.add_argument("--n-queries", type=int, default=2000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output-dir", default="proofs/perf")
    parser.add_argument("--embedder", default=None)
    parser.add_argument("--index-path", default=None)
    parser.add_argument("--ids-path", default=None)
    parser.add_argument("--model-name", default=None)
    args = parser.parse_args()

    print("Chargement ground truth...")
    gt_full = load_ground_truth_from_csv(GT_MODALITY_CSV, GT_ORGAN_CSV, GT_MO_CSV)

    # FILTRE 1 : ne garder que les images annotées dans les 3 CSV
    gt_strict = {
        img_id: gt
        for img_id, gt in gt_full.items()
        if gt["modalite"] and gt["organe"] and gt["mo"]
    }

    print(f"  Ground truth complet : {len(gt_full):,} images")
    print(f"  Ground truth STRICT  : {len(gt_strict):,} images (annotées dans les 3 CSV)")
    print(f"  Couverture stricte   : {100*len(gt_strict)/len(gt_full):.1f}%")

    resources = load_resources(
        mode=args.mode,
        embedder=args.embedder,
        model_name=args.model_name,
        index_path=args.index_path,
        ids_path=args.ids_path,
        load_embedder=False,
    )
    print(f"Index charge : {resources.index.ntotal} vecteurs")

    # FILTRE 2 : sélectionner uniquement les requêtes avec annotation complète
    evaluable = [r for r in resources.rows if r.get("image_id", "") in gt_strict]
    print(f"  Images dans index ET annotées : {len(evaluable):,}")

    if args.n_queries > len(evaluable):
        print(f"[WARN] Demande {args.n_queries} requetes mais seulement {len(evaluable)} eligibles.")
        args.n_queries = len(evaluable)

    query_rows = random.Random(args.seed).sample(evaluable, args.n_queries)
    print(f"\nmode={args.mode}  k={args.k}  n_queries={len(query_rows)}  seed={args.seed}")

    query_results, result_details = evaluate_strict(
        query_rows, resources, args.k, gt_full, gt_strict, args.mode
    )
    metrics = compute_metrics_strict(query_results, result_details)

    print(f"\n{'='*60}")
    print(f"  EVALUATION STRICTE -- mode={args.mode}  k={args.k}  seed={args.seed}")
    print(f"{'='*60}")
    print(f"  Requetes evaluees       : {metrics.get('n_queries_total')}")
    print(f"  Resultats evalues       : {metrics.get('n_results_evalues')}")
    print(f"  Resultats / requete     : {metrics.get('results_par_requete', 0):.2f} / {args.k}")

    print(f"\n  --- TM -- Taux Modalite ---")
    print(f"    TM_requetes  : {metrics.get('TM_requetes', 0)*100:.2f}%")
    print(f"    TM_resultats : {metrics.get('TM_resultats', 0)*100:.2f}%")

    print(f"\n  --- TA -- Taux Anatomie ---")
    print(f"    TA_requetes  : {metrics.get('TA_requetes', 0)*100:.2f}%")
    print(f"    TA_resultats : {metrics.get('TA_resultats', 0)*100:.2f}%")

    print(f"\n  --- TMO -- Modalite+Organe combine ---")
    print(f"    TMO_requetes  : {metrics.get('TMO_requetes', 0)*100:.2f}%")
    print(f"    TMO_resultats : {metrics.get('TMO_resultats', 0)*100:.2f}%")

    output_dir = resolve_path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"eval_strict_{args.mode}_seed{args.seed}_{timestamp}.csv"

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["metric", "value"])
        for k_, v_ in metrics.items():
            w.writerow([k_, v_])

    print(f"\nResultats sauvegardes : {output_file}")


if __name__ == "__main__":
    main()
