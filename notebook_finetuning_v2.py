"""
Fine-tuning BiomedCLIP sur ROCOv2 — Version 2 (alignée évaluation MediScan)
============================================================================

Changements vs v1 :
- InfoNCE standard (temperature 0.07) au lieu de DHN-NCE
- LR 1e-6 (vs 2e-6) — plus prudent pour BiomedCLIP
- Validation par PROXY CUI (mesure le partage de concepts médicaux)
  → s'arrête automatiquement quand ça améliore la métrique réelle
- Upload HuggingFace après CHAQUE epoch (impossible de perdre le checkpoint)
- 5 epochs max, patience=1

Coller cellule par cellule dans Kaggle Notebook (GPU T4 x2)
"""

# ===========================================================================
# CELLULE 1 — Token HuggingFace (sécurisé)
# ===========================================================================

from kaggle_secrets import UserSecretsClient
import os
secrets = UserSecretsClient()
os.environ["HF_TOKEN"] = secrets.get_secret("HF_TOKEN")
print("Token HF chargé")


# ===========================================================================
# CELLULE 2 — Installation
# ===========================================================================

# !pip install -q open_clip_torch datasets huggingface_hub


# ===========================================================================
# CELLULE 3 — Imports + Config
# ===========================================================================

import json
import math
import os
from collections import defaultdict

import numpy as np
import open_clip
import torch
import torch.nn as nn
import torch.nn.functional as F
from datasets import load_dataset
from huggingface_hub import HfApi
from torch.cuda.amp import GradScaler, autocast
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm

DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_NAME = "hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224"

# Hyperparamètres CONSERVATEURS
BATCH_SIZE      = 64
ACCUM_STEPS     = 8         # Effective batch = 512 (vs 1024 avant — moins agressif)
EPOCHS          = 5         # 5 max au lieu de 10
LR              = 1e-6      # Encore plus bas (vs 2e-6 avant)
WARMUP_RATIO    = 0.10      # Plus de warmup
PATIENCE        = 1         # Stop dès que la validation CUI ne s'améliore plus
TEMPERATURE     = 0.07      # STANDARD CLIP (vs 0.03 avant qui a tout cassé)
UNFREEZE_BLOCKS = 2         # Dégeler les 2 derniers blocs visual + text

CHECKPOINT = "best_biomedclip_v2.pt"
HF_REPO    = "Ozantsk/biomedclip-rocov2-v2"  # ← MODIFIER si besoin

print(f"Device          : {DEVICE}")
print(f"GPUs            : {torch.cuda.device_count()}")
print(f"Effective batch : {BATCH_SIZE * ACCUM_STEPS}")
print(f"Temperature     : {TEMPERATURE}")
print(f"LR              : {LR}")


# ===========================================================================
# CELLULE 4 — Chargement dataset ROCOv2
# ===========================================================================

print("Chargement de ROCOv2...")
ds = load_dataset("eltorio/ROCOv2-radiology")
print(f"Train : {len(ds['train']):,}")
print(f"Val   : {len(ds['validation']):,}")
print(f"Test  : {len(ds['test']):,}")

# Vérifier les colonnes disponibles (CUI ou concepts)
print(f"\nColonnes : {ds['train'].column_names}")
print(f"Exemple  : {ds['train'][0].keys()}")


# ===========================================================================
# CELLULE 5 — Dataset PyTorch (avec extraction des CUIs)
# ===========================================================================

class ROCODataset(Dataset):
    def __init__(self, hf_split, transform, tokenizer):
        self.data      = hf_split
        self.transform = transform
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item    = self.data[idx]
        image   = self.transform(item["image"].convert("RGB"))
        caption = item["caption"]
        text    = self.tokenizer([caption])[0]

        # Extraire les CUIs si dispo (pour la validation CUI)
        cuis = item.get("cui", item.get("concepts", []))
        if isinstance(cuis, str):
            cuis = [c.strip() for c in cuis.split(";") if c.strip()]
        elif cuis is None:
            cuis = []

        return image, text, idx, cuis


def collate_with_cuis(batch):
    """Custom collate qui garde les CUIs comme liste de listes."""
    images = torch.stack([b[0] for b in batch])
    texts  = torch.stack([b[1] for b in batch])
    idxs   = torch.tensor([b[2] for b in batch])
    cuis   = [b[3] for b in batch]
    return images, texts, idxs, cuis


# ===========================================================================
# CELLULE 6 — Chargement modèle + freeze partiel
# ===========================================================================

print("Chargement de BiomedCLIP...")
model, _, preprocess = open_clip.create_model_and_transforms(MODEL_NAME)
tokenizer_hf = open_clip.get_tokenizer(MODEL_NAME)
model = model.to(DEVICE)

# Tout geler
for p in model.parameters():
    p.requires_grad = False

# Dégeler les N derniers blocs visual
for block in model.visual.trunk.blocks[-UNFREEZE_BLOCKS:]:
    for p in block.parameters():
        p.requires_grad = True

# Dégeler les N derniers blocs text
for block in model.text.transformer.encoder.layer[-UNFREEZE_BLOCKS:]:
    for p in block.parameters():
        p.requires_grad = True

# Dégeler les projections
if hasattr(model.visual, 'head'):
    for p in model.visual.head.parameters():
        p.requires_grad = True
for p in model.text.proj.parameters():
    p.requires_grad = True

total     = sum(p.numel() for p in model.parameters())
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Trainable : {trainable:,} / {total:,} ({100*trainable/total:.1f}%)")


# ===========================================================================
# CELLULE 7 — DataLoaders
# ===========================================================================

train_ds = ROCODataset(ds["train"],      preprocess, tokenizer_hf)
val_ds   = ROCODataset(ds["validation"], preprocess, tokenizer_hf)

train_loader = DataLoader(
    train_ds, batch_size=BATCH_SIZE, shuffle=True,
    num_workers=4, pin_memory=True, drop_last=True,
    collate_fn=collate_with_cuis,
)
val_loader = DataLoader(
    val_ds, batch_size=BATCH_SIZE, shuffle=False,
    num_workers=4, pin_memory=True,
    collate_fn=collate_with_cuis,
)

print(f"Batches train : {len(train_loader)}")
print(f"Batches val   : {len(val_loader)}")


# ===========================================================================
# CELLULE 8 — InfoNCE standard (température 0.07)
# ===========================================================================

def info_nce_loss(img_emb, txt_emb, temperature=TEMPERATURE):
    """InfoNCE symétrique standard CLIP — sans modification agressive."""
    img_emb = F.normalize(img_emb, dim=-1)
    txt_emb = F.normalize(txt_emb, dim=-1)

    logits_i2t = (img_emb @ txt_emb.T) / temperature
    logits_t2i = logits_i2t.T

    labels = torch.arange(len(img_emb), device=DEVICE)
    loss = (F.cross_entropy(logits_i2t, labels) +
            F.cross_entropy(logits_t2i, labels)) / 2
    return loss


# ===========================================================================
# CELLULE 9 — Validation CUI : la métrique alignée sur MediScan
# ===========================================================================

@torch.no_grad()
def validate_cui_precision(model, loader, k=10):
    """
    Précision@K basée sur le partage de CUIs.

    POUR CHAQUE image du val set :
    1. Encoder son texte (caption) comme requête
    2. Chercher les K images les plus proches dans tout le val set
    3. Mesurer combien partagent au moins 1 CUI avec la requête
       (excluant l'image elle-même)

    C'est EXACTEMENT la métrique 'precision_at_k' utilisée par
    evaluate_full.py côté MediScan.
    """
    model.eval()

    all_img_emb = []
    all_txt_emb = []
    all_cuis    = []
    all_idxs    = []

    for images, texts, idxs, cuis in tqdm(loader, desc="Encodage val"):
        images = images.to(DEVICE)
        texts  = texts.to(DEVICE)
        with autocast():
            img_feat = F.normalize(model.encode_image(images), dim=-1)
            txt_feat = F.normalize(model.encode_text(texts),  dim=-1)
        all_img_emb.append(img_feat.cpu().float())
        all_txt_emb.append(txt_feat.cpu().float())
        all_cuis.extend(cuis)
        all_idxs.extend(idxs.tolist())

    img_matrix = torch.cat(all_img_emb)  # (N, dim)
    txt_matrix = torch.cat(all_txt_emb)

    # Sims texte → image
    sims = txt_matrix @ img_matrix.T  # (N, N)

    # Pour chaque requête, top-k+1 (on exclut la requête elle-même)
    topk = sims.topk(k + 1, dim=1).indices.tolist()

    # Calcul Precision@K via CUI (et Hit@K clinique en bonus)
    n           = len(all_cuis)
    n_eligible  = 0
    sum_prec_k  = 0.0
    hit_at_1    = 0
    hit_at_5    = 0
    hit_at_10   = 0

    for i in range(n):
        query_cuis = set(all_cuis[i])
        if not query_cuis:
            continue
        n_eligible += 1

        retrieved = [j for j in topk[i] if j != i][:k]

        # Precision@K : % de résultats qui partagent ≥ 1 CUI avec la requête
        n_relevant = sum(
            1 for j in retrieved
            if query_cuis & set(all_cuis[j])
        )
        sum_prec_k += n_relevant / k

        # Hit@K clinique : au moins un résultat partage >= 1 CUI avec la requête.
        if retrieved[:1] and query_cuis & set(all_cuis[retrieved[0]]):
            hit_at_1 += 1
        if any(query_cuis & set(all_cuis[j]) for j in retrieved[:5]):
            hit_at_5 += 1
        if any(query_cuis & set(all_cuis[j]) for j in retrieved[:10]):
            hit_at_10 += 1

    return {
        "precision_at_k_cui": (sum_prec_k / n_eligible * 100) if n_eligible else 0,
        "n_eligible":         n_eligible,
        "hit_at_1":           hit_at_1 / n * 100,
        "hit_at_5":           hit_at_5 / n * 100,
        "hit_at_10":          hit_at_10 / n * 100,
    }


# ===========================================================================
# CELLULE 10 — Optimizer + Scheduler
# ===========================================================================

optimizer = torch.optim.AdamW(
    [p for p in model.parameters() if p.requires_grad],
    lr=LR, weight_decay=0.01, betas=(0.9, 0.98),
)

total_steps  = (len(train_loader) // ACCUM_STEPS) * EPOCHS
warmup_steps = int(total_steps * WARMUP_RATIO)

def lr_lambda(step):
    if step < warmup_steps:
        return step / max(warmup_steps, 1)
    progress = (step - warmup_steps) / max(total_steps - warmup_steps, 1)
    return 0.5 * (1 + math.cos(math.pi * progress))

scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)
scaler    = GradScaler()

print(f"Total steps  : {total_steps}")
print(f"Warmup steps : {warmup_steps}")


# ===========================================================================
# CELLULE 11 — BASELINE : évaluer le modèle ORIGINAL avant fine-tuning
# ===========================================================================

print("\n" + "=" * 60)
print("BASELINE — BiomedCLIP original (avant fine-tuning)")
print("=" * 60)

baseline_metrics = validate_cui_precision(model, val_loader, k=10)
print(f"\nPrécision@10 (CUI) : {baseline_metrics['precision_at_k_cui']:.2f}%")
print(f"Hit@1 clinique     : {baseline_metrics['hit_at_1']:.2f}%")
print(f"Hit@5 clinique     : {baseline_metrics['hit_at_5']:.2f}%")
print(f"Hit@10 clinique    : {baseline_metrics['hit_at_10']:.2f}%")
print(f"N éligibles (CUI)  : {baseline_metrics['n_eligible']}")

# Sauvegarder la baseline pour comparer après
BASELINE_CUI = baseline_metrics['precision_at_k_cui']


# ===========================================================================
# CELLULE 12 — Boucle d'entraînement avec validation CUI + upload HF
# ===========================================================================

api = HfApi()
api.create_repo(HF_REPO, exist_ok=True)
print(f"Repo HF prêt : {HF_REPO}")

best_cui = BASELINE_CUI  # On ne sauvegarde QUE si on bat la baseline
patience_counter = 0
history = []

print("\n" + "=" * 60)
print(f"FINE-TUNING — {EPOCHS} epochs max, patience={PATIENCE}")
print(f"Baseline CUI à battre : {BASELINE_CUI:.2f}%")
print("=" * 60)

for epoch in range(1, EPOCHS + 1):
    # ── Train ────────────────────────────────────────────────────
    model.train()
    train_loss = 0.0
    optimizer.zero_grad()

    for step, (images, texts, _, _) in enumerate(tqdm(train_loader, desc=f"Train {epoch}")):
        images = images.to(DEVICE)
        texts  = texts.to(DEVICE)

        with autocast():
            img_feat = model.encode_image(images)
            txt_feat = model.encode_text(texts)
            loss     = info_nce_loss(img_feat, txt_feat) / ACCUM_STEPS

        scaler.scale(loss).backward()
        train_loss += loss.item() * ACCUM_STEPS

        if (step + 1) % ACCUM_STEPS == 0:
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(
                [p for p in model.parameters() if p.requires_grad], max_norm=1.0,
            )
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()
            scheduler.step()

    train_loss /= len(train_loader)

    # ── Validation alignée sur la métrique MediScan ──────────────
    val_metrics = validate_cui_precision(model, val_loader, k=10)
    cui = val_metrics['precision_at_k_cui']

    history.append({
        "epoch": epoch,
        "train_loss": train_loss,
        "val_cui_p@10": cui,
        "val_hit@1": val_metrics['hit_at_1'],
        "val_hit@5": val_metrics['hit_at_5'],
        "val_hit@10": val_metrics['hit_at_10'],
    })

    print(f"\nEpoch {epoch}/{EPOCHS}")
    print(f"  Train loss       : {train_loss:.4f}")
    print(f"  Val Precision@10 : {cui:.2f}%  (baseline: {BASELINE_CUI:.2f}%)")
    print(f"  Val Hit@10       : {val_metrics['hit_at_10']:.2f}%")

    # ── Sauvegarde + Upload HF UNIQUEMENT si on bat la baseline ──
    if cui > best_cui:
        best_cui = cui
        patience_counter = 0

        # 1. Sauvegarde locale
        torch.save(model.state_dict(), CHECKPOINT)
        print(f"  ✓ AMÉLIORATION : +{cui - BASELINE_CUI:.2f}% sur baseline")

        # 2. Upload immédiat sur HF (pour ne pas perdre)
        try:
            api.upload_file(
                path_or_fileobj=CHECKPOINT,
                path_in_repo=f"epoch_{epoch}_cui{cui:.2f}.pt",
                repo_id=HF_REPO,
            )
            api.upload_file(
                path_or_fileobj=CHECKPOINT,
                path_in_repo="best.pt",  # alias toujours à jour
                repo_id=HF_REPO,
            )
            print(f"  ✓ Uploadé sur HF : {HF_REPO}/epoch_{epoch}_cui{cui:.2f}.pt")
        except Exception as e:
            print(f"  ⚠ Upload HF échoué : {e}")
    else:
        patience_counter += 1
        print(f"  ✗ Pas d'amélioration (patience {patience_counter}/{PATIENCE})")

        if patience_counter >= PATIENCE:
            print(f"\nEarly stopping à l'epoch {epoch}")
            break

print(f"\n{'=' * 60}")
print(f"FIN DE L'ENTRAÎNEMENT")
print(f"  Baseline CUI    : {BASELINE_CUI:.2f}%")
print(f"  Meilleur CUI    : {best_cui:.2f}%")
print(f"  Gain            : {best_cui - BASELINE_CUI:+.2f}%")
print(f"{'=' * 60}")


# ===========================================================================
# CELLULE 13 — Sauvegarder les métadonnées d'entraînement
# ===========================================================================

with open("training_history.json", "w") as f:
    json.dump({
        "base_model":  MODEL_NAME,
        "dataset":     "eltorio/ROCOv2-radiology",
        "config": {
            "batch_size":      BATCH_SIZE,
            "accum_steps":     ACCUM_STEPS,
            "effective_batch": BATCH_SIZE * ACCUM_STEPS,
            "lr":              LR,
            "temperature":     TEMPERATURE,
            "epochs_max":      EPOCHS,
            "patience":        PATIENCE,
        },
        "baseline_cui_p@10":  BASELINE_CUI,
        "best_cui_p@10":      best_cui,
        "gain":               best_cui - BASELINE_CUI,
        "history":            history,
    }, f, indent=2)

api.upload_file(
    path_or_fileobj="training_history.json",
    path_in_repo="training_history.json",
    repo_id=HF_REPO,
)
print(f"\nMétadonnées uploadées sur https://huggingface.co/{HF_REPO}")
print("\nPour utiliser le modèle dans MediScan :")
print(f"  → Télécharger : huggingface.co/{HF_REPO}/blob/main/best.pt")
print(f"  → Reconstruire l'index sémantique avec ce modèle")
print(f"  → Relancer evaluate_full.py --mode semantic")
