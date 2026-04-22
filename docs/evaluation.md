# Évaluation MediScan — Baseline 2000 requêtes

| Champ | Valeur |
|---|---|
| Date | 8 avril 2026 |
| Dataset | ROCOv2 |
| Images indexées | 59 962 |
| Requêtes tirées | 2 000 |
| Requêtes évaluées | 1 999 |
| Seed | 42 |
| K | 10 |
| Ground truth | CSV ROCOv2 GLOBAL |

## Scripts sources

| Fichier | Rôle |
|---|---|
| `scripts/evaluation/evaluate_full.py` | Évaluation standard : `TM`, `TA`, `TMO`, `Precision@K`, et pour le visuel `SSIM` + `HIST` |
| `scripts/evaluation/evaluate_strict.py` | Évaluation stricte : mêmes métriques `TM`, `TA`, `TMO`, mais seulement sur les images annotées dans les 3 CSV |
| `scripts/evaluation/evaluate_typed.py` | Variante CUI typée : `TM`, `TA`, `TP` par catégories UMLS |
| `scripts/evaluation/evaluate_cui.py` | Overlap CUI général |
| `scripts/evaluation/evaluate_text.py` | Évaluation text-to-image |
| `scripts/evaluation/evaluate_relaunch.py` | Évaluation de la relance successive depuis un résultat |
| `scripts/evaluation/benchmark.py` | Temps, stabilité et coût de requête |

## Légende des métriques

| Métrique | Niveau | Définition exacte |
|---|---|---|
| `TM_requetes` | requête | part des requêtes avec au moins 1 résultat de même modalité |
| `TM_resultats` | résultat | part des résultats individuels de même modalité |
| `TA_requetes` | requête | part des requêtes avec au moins 1 résultat de même organe |
| `TA_resultats` | résultat | part des résultats individuels de même organe |
| `TMO_requetes` | requête | part des requêtes avec au moins 1 résultat ayant le bon couple modalité+organe |
| `TMO_resultats` | résultat | part des résultats individuels ayant le bon couple modalité+organe |
| `Precision@K (CUI)` | résultat moyen par requête | moyenne du ratio de résultats partageant au moins 1 CUI avec la requête |
| `SSIM` | visuel | similarité structurelle pixel à pixel |
| `HIST` | visuel | similarité d’histogramme de niveaux de gris |
| `TP_requetes` | requête | part des requêtes avec au moins 1 résultat partageant le même finding/pathologie |
| `TP_resultats` | résultat | part des résultats individuels partageant le même finding/pathologie |

## Lecture rapide

| Lecture | Interprétation |
|---|---|
| `_requetes` haut, `_resultats` bas | le moteur trouve parfois juste, mais avec bruit |
| `_requetes` haut, `_resultats` haut | le moteur trouve juste souvent et densément |
| `TMO_resultats` | métrique principale pour un usage clinique image similaire “même modalité + même organe” |

## Résultats standard

| Rappel | Signification |
|---|---|
| `TM_resultats` | % de résultats du bon type d’imagerie |
| `TA_resultats` | % de résultats du bon organe |
| `TMO_resultats` | % de résultats bon type + bon organe |
| `Precision@K (CUI)` | % moyen de résultats partageant au moins 1 CUI |

### Semantic — standard

| Métrique | Score | Seuil | Statut | Lecture |
|---|---|---|---|---|
| `TM_requetes` | 98.5% | 80% | PASS | ≥1 bon type d’imagerie |
| `TM_resultats` | 93.8% | 65% | PASS | densité du bon type |
| `TA_requetes` | 89.3% | 60% | PASS | ≥1 bon organe |
| `TA_resultats` | 45.9% | 35% | PASS | densité du bon organe |
| `TMO_requetes` | 87.9% | 50% | PASS | ≥1 bon type+organe |
| `TMO_resultats` | 45.7% | 35% | PASS | densité type+organe |
| `Precision@K (CUI)` | 93.9% | 30% | PASS | pertinence médicale globale |

| Base de calcul | Valeur |
|---|---|
| Requêtes totales | 1 999 |
| Requêtes avec organe annoté | 318 |
| Requêtes avec modalité+organe annotés | 398 |

### Visual — standard

| Métrique | Score | Seuil | Statut | Lecture |
|---|---|---|---|---|
| `TM_requetes` | 98.6% | 90% | PASS | ≥1 bon type d’imagerie |
| `TM_resultats` | 92.2% | 80% | PASS | densité du bon type |
| `TA_requetes` | 86.2% | 70% | PASS | ≥1 bon organe |
| `TA_resultats` | 39.7% | 30% | PASS | densité du bon organe |
| `TMO_requetes` | 85.2% | 60% | PASS | ≥1 bon type+organe |
| `TMO_resultats` | 40.7% | 35% | PASS | densité type+organe |
| `Precision@K (CUI)` | 92.3% | — | — | pertinence médicale globale |
| `SSIM moyen` | 25.1% | 20% | PASS | similarité structurelle |
| `HIST moyen` | 56.7% | 50% | PASS | cohérence de distribution de gris |

## Comparaison standard

| Rappel | Signification |
|---|---|
| `TM_resultats` | bon type d’imagerie |
| `TA_resultats` | bon organe |
| `TMO_resultats` | bon type + bon organe |

| Métrique | Visual | Semantic | Écart semantic - visual | Vainqueur |
|---|---|---|---|---|
| `TM_resultats` | 92.2% | 93.8% | +1.6% | Semantic |
| `TA_resultats` | 39.7% | 45.9% | +6.2% | Semantic |
| `TMO_resultats` | 40.7% | 45.7% | +5.0% | Semantic |
| `Precision@K (CUI)` | 92.3% | 93.9% | +1.6% | Semantic |

## Ce que mesurent vraiment les métriques

| Métrique | À quoi elle correspond dans les scripts |
|---|---|
| `TM_*` | comparaison exacte du champ `modalite` entre requête et résultat |
| `TA_*` | comparaison exacte du champ `organe` entre requête et résultat |
| `TMO_*` | comparaison exacte du champ `mo` dans les CSV, donc match exact modalité+organe |
| `Precision@K (CUI)` | overlap d’au moins 1 CUI entre requête et résultat, moyenné sur les requêtes |
| `SSIM` | moyenne des similarités structurelles entre image requête et résultats |
| `HIST` | moyenne des similarités d’histogramme entre image requête et résultats |
| `TP_*` | overlap de CUI typés `finding` dans `evaluate_typed.py` |

## Robustesse statistique

| Métrique | 200 requêtes | 2 000 requêtes | Écart max |
|---|---|---|---|
| Semantic `TM_resultats` | 93.9% | 93.8% | 0.1% |
| Semantic `TA_resultats` | 45.2% | 45.9% | 0.7% |
| Semantic `TMO_resultats` | 41.6% | 45.7% | 4.1% |
| Semantic `Precision@K` | 93.9% | 93.9% | 0.0% |
| Visual `TM_resultats` | 92.5% | 92.2% | 0.3% |
| Visual `TA_resultats` | 40.0% | 39.7% | 0.3% |

## Évaluation stricte

| Rappel | Signification |
|---|---|
| Évaluation stricte | requêtes et résultats limités aux images annotées dans les 3 CSV |
| Effet | supprime le biais dû aux annotations manquantes |
| `TMO_resultats` | reste la métrique principale |

| Jeu strict | Valeur |
|---|---|
| Images annotées dans les 3 CSV | 12 251 |
| Couverture du dataset | 15.4% |

### Semantic — strict

| Métrique | Standard | Strict | Différence |
|---|---|---|---|
| `TM_requetes` | 98.5% | 90.3% | -8.2% |
| `TM_resultats` | 93.8% | 96.6% | +2.8% |
| `TA_requetes` | 89.3% | 89.6% | +0.3% |
| `TA_resultats` | 45.9% | 94.7% | +48.8% |
| `TMO_requetes` | 87.9% | 87.3% | -0.6% |
| `TMO_resultats` | 45.7% | 90.4% | +44.7% |

| Base stricte semantic | Valeur |
|---|---|
| Requêtes évaluées | 1 998 |
| Résultats évalués | 9 563 |
| Résultats annotés par requête | 4.79 / 10 |

### Visual — strict

| Métrique | Standard | Strict | Différence |
|---|---|---|---|
| `TM_requetes` | 98.6% | 89.3% | -9.3% |
| `TM_resultats` | 92.2% | 96.6% | +4.4% |
| `TA_requetes` | 86.2% | 86.5% | +0.3% |
| `TA_resultats` | 39.7% | 89.8% | +50.1% |
| `TMO_requetes` | 85.2% | 84.2% | -1.0% |
| `TMO_resultats` | 40.7% | 86.3% | +45.6% |

| Base stricte visual | Valeur |
|---|---|
| Requêtes évaluées | 1 998 |
| Résultats évalués | 8 620 |
| Résultats annotés par requête | 4.31 / 10 |

## Comparaison stricte

| Rappel | Signification |
|---|---|
| `TM_resultats` | bon type d’imagerie |
| `TA_resultats` | bon organe |
| `TMO_resultats` | bon type + bon organe |

| Métrique | Visual strict | Semantic strict | Écart semantic - visual | Vainqueur |
|---|---|---|---|---|
| `TM_resultats` | 96.6% | 96.6% | 0.0% | Égalité |
| `TA_resultats` | 89.8% | 94.7% | +4.9% | Semantic |
| `TMO_resultats` | 86.3% | 90.4% | +4.1% | Semantic |

## Baselines officielles à battre

| Rappel | Signification |
|---|---|
| `TM_resultats` | déjà très haut, faible marge |
| `TA_resultats` | anatomie |
| `TMO_resultats` | métrique principale pour le fine-tuning |

### Cible Semantic stricte

| Métrique | Baseline | Lecture |
|---|---|---|
| `TM_resultats` | 96.6% | déjà excellent |
| `TA_resultats` | 94.7% | amélioration possible |
| `TMO_resultats` | 90.4% | cible principale |

### Contrôle Visual strict

| Métrique | Baseline | Attendu après fine-tuning semantic |
|---|---|---|
| `TM_resultats` | 96.6% | identique |
| `TA_resultats` | 89.8% | identique |
| `TMO_resultats` | 86.3% | identique |

## Critères de succès du fine-tuning

| Niveau | `TMO_resultats` strict semantic | Verdict |
|---|---|---|
| Échec | < 90.4% | régression |
| Neutre | 90.4% – 91.0% | pas de gain réel |
| Succès modéré | 91.0% – 92.0% | gain mesurable |
| Succès franc | 92.0% – 94.0% | excellent |
| Succès exceptionnel | > 94.0% | très forte validation |

| Cible réaliste | Valeur |
|---|---|
| `TMO_resultats` strict semantic | 91% – 92% |

## Limites

| Limite | Effet |
|---|---|
| Couverture stricte faible | seulement 15.4% du dataset entre dans l’évaluation stricte |
| Match exact | les variantes proches restent comptées comme différentes |
| Pas de texte libre ici | le text-to-image n’est pas mesuré dans ce document |
| `K=10` fixe | pas de vue sur la sensibilité au rang |

## Reproduction

| Type | Commande |
|---|---|
| Standard semantic | `PYTHONPATH=src python scripts/evaluation/evaluate_full.py --mode semantic --k 10 --n-queries 2000 --seed 42` |
| Standard visual | `PYTHONPATH=src python scripts/evaluation/evaluate_full.py --mode visual --k 10 --n-queries 2000 --seed 42` |
| Strict semantic | `PYTHONPATH=src python scripts/evaluation/evaluate_strict.py --mode semantic --k 10 --n-queries 2000 --seed 42` |
| Strict visual | `PYTHONPATH=src python scripts/evaluation/evaluate_strict.py --mode visual --k 10 --n-queries 2000 --seed 42` |

## Fichiers de baseline

| Fichier | Usage |
|---|---|
| `proofs/perf/eval_gt_semantic_seed42_20260408_114617.csv` | standard semantic |
| `proofs/perf/eval_gt_visual_seed42_20260408_115028.csv` | standard visual |
| `proofs/perf/eval_strict_semantic_seed42_20260408_125631.csv` | strict semantic |
| `proofs/perf/eval_strict_visual_seed42_20260408_125638.csv` | strict visual |
