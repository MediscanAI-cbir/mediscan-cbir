# Compte-rendu — Fine-tuning de BiomedCLIP sur ROCOv2

**Projet** : MediScan — Recherche d'images médicales par similarité
**Date** : Avril 2026
**Niveau** : L3 Informatique

---

## 1. Contexte et objectif

### Qu'est-ce que MediScan fait ?

MediScan est une application de recherche d'images médicales. L'utilisateur tape une requête textuelle (par exemple : *"chest X-ray with pneumonia"*) et l'application retrouve les images les plus similaires dans une base de données.

Pour faire cette recherche, MediScan utilise un modèle d'intelligence artificielle appelé **BiomedCLIP**, capable de transformer à la fois des images et du texte en vecteurs numériques (des listes de nombres), puis de comparer ces vecteurs pour trouver les images les plus proches de la requête.

### Le problème identifié

BiomedCLIP a été entraîné sur **15 millions** de paires image-texte issues de publications médicales (PubMed). C'est un modèle très généraliste.

Or, la base de données de MediScan utilise exclusivement **ROCOv2**, un dataset de ~80 000 images radiologiques avec leurs légendes. Le modèle n'a pas été spécifiquement optimisé pour ce dataset.

L'idée du fine-tuning est simple : *adapter* BiomedCLIP à ROCOv2 pour que les recherches soient plus précises.

---

## 2. Qu'est-ce que le fine-tuning ?

### Analogie simple

Imaginez un médecin généraliste (BiomedCLIP pré-entraîné) qui a étudié toute la médecine pendant des années. Il est très compétent de façon générale. Le fine-tuning, c'est comme lui faire faire un stage de spécialisation en radiologie (ROCOv2). À la fin du stage, il est toujours aussi bon en médecine générale, mais il est maintenant encore meilleur en radiologie.

### Ce que ça change techniquement

Avant le fine-tuning, les vecteurs produits par BiomedCLIP pour les images ROCOv2 ne sont pas parfaitement calibrés pour ce dataset spécifique. Après le fine-tuning, le modèle apprend à mieux aligner les images ROCOv2 avec leurs légendes, ce qui améliore la recherche.

---

## 3. Le dataset : ROCOv2

| Split | Nombre d'images | Rôle |
|---|---|---|
| Train | 59 962 | Apprentissage du modèle |
| Validation | 9 904 | Surveillance pendant l'entraînement |
| Test | 9 927 | Évaluation finale honnête |

**Pourquoi 3 splits ?**

- **Train** : les données sur lesquelles le modèle apprend, comme les exercices d'un cours.
- **Validation** : données que le modèle ne voit jamais pendant l'apprentissage, utilisées pour détecter si le modèle commence à trop mémoriser (overfitting) plutôt qu'à vraiment comprendre.
- **Test** : données gardées complètement à l'écart jusqu'à la fin, pour mesurer honnêtement les performances finales.

---

## 4. Les choix techniques

### 4.1 La loss contrastive (comment le modèle apprend)

Le modèle apprend grâce à une **loss contrastive** (appelée InfoNCE ou CLIP Loss). Voici comment ça fonctionne :

1. On donne au modèle un batch (groupe) de 64 paires image-caption.
2. Le modèle encode chaque image et chaque caption en vecteur.
3. La loss mesure si l'image n°1 est bien plus proche de la caption n°1 que de toutes les autres captions du batch.
4. Si ce n'est pas le cas, les poids du modèle sont ajustés pour corriger ça.

```
Batch de 64 paires :
  Image 1  ←→  Caption 1  ✓ (doivent être proches)
  Image 1  ←→  Caption 2  ✗ (doivent être éloignées)
  Image 1  ←→  Caption 3  ✗ (doivent être éloignées)
  ...
```

### 4.2 Le learning rate (vitesse d'apprentissage)

**Valeur choisie : 5e-6 (= 0.000005)**

C'est une valeur très basse, choisie intentionnellement pour deux raisons :
- Éviter le **catastrophic forgetting** : si on apprend trop vite, le modèle "écrase" les 15 millions d'exemples qu'il a vus avant et perd ses capacités générales.
- ROCOv2 représente seulement 0.6% des données d'origine de BiomedCLIP, donc on veut "nudger" doucement le modèle, pas le réécrire.

### 4.3 Les epochs

**Définition** : Une epoch = le modèle a vu une fois toutes les images du dataset d'entraînement.

Avec 59 962 images et des batchs de 64 images :
```
1 epoch = 59 962 / 64 = ~937 batches
```

**Maximum fixé : 10 epochs**, mais l'early stopping arrête probablement avant.

### 4.4 L'early stopping (arrêt automatique)

**Patience = 2**

Après chaque epoch, on calcule la loss sur le set de validation. Si la validation loss ne s'améliore pas pendant 2 epochs consécutives, on arrête l'entraînement et on garde le meilleur modèle.

```
Epoch 1 : Val loss = 2.10  → meilleur, on sauvegarde
Epoch 2 : Val loss = 1.85  → meilleur, on sauvegarde
Epoch 3 : Val loss = 1.72  → meilleur, on sauvegarde
Epoch 4 : Val loss = 1.74  → pas mieux (patience 1/2)
Epoch 5 : Val loss = 1.76  → pas mieux (patience 2/2) → STOP
           ↑ On garde le modèle de l'epoch 3
```

### 4.5 Le scheduler cosine avec warmup

Le learning rate ne reste pas fixe pendant tout l'entraînement :
- **Warmup (5% des steps)** : le LR monte progressivement de 0 à 5e-6 pour éviter les instabilités au démarrage.
- **Cosine decay** : le LR diminue progressivement en suivant une courbe cosinus jusqu'à 0.

```
LR
 |  /‾‾\
 | /    \
 |/      \______
 +-------------→ steps
  warmup  decay
```

### 4.6 Mixed Precision (fp16)

Les calculs sont effectués en **demi-précision** (float16 au lieu de float32), ce qui divise par 2 la mémoire GPU nécessaire et accélère l'entraînement d'environ 2x sans perte de qualité notable.

---

## 5. Infrastructure d'entraînement

### Plateforme : Kaggle Notebooks

| Critère | Détail |
|---|---|
| GPU | 2x NVIDIA T4 (16 Go VRAM chacun) |
| Coût | Gratuit (30h/semaine) |
| Avantage principal | ROCOv2 disponible directement, sessions stables |

**Pourquoi Kaggle plutôt que local (MacBook Air M2) ?**

Le MacBook Air M2 avec 8 Go de RAM unifiée peut faire de l'inférence (utiliser un modèle), mais pas entraîner un modèle de cette taille. BiomedCLIP contient ~196 millions de paramètres et l'entraînement nécessite de stocker les gradients en mémoire, ce qui dépasse largement les capacités du Mac.

### Comparaison des plateformes

| Plateforme | GPU | Temps estimé (5 epochs) | Prix |
|---|---|---|---|
| MacBook Air M2 | Apple M2 (CPU/MPS) | ~48h | Gratuit |
| Kaggle T4 x2 | NVIDIA T4 x2 | ~1h30 | Gratuit |
| Google Colab Pro A100 | NVIDIA A100 | ~25 min | 10$/mois |

---

## 6. Déroulement de l'entraînement

### Session du 8 avril 2026

**Environnement** : Kaggle Notebook, GPU T4 x2, Python 3.10

**Statut observé** :
```
Device : cuda
GPUs   : 2
Train  : 59 962 images
Val    : 9 904 images
Test   : 9 927 images
Batches train : 937
Batches val   : 155
Batches test  : 156

Début du fine-tuning — 10 epochs max, patience=2
Train: 30%|███ | 285/937 [05:34<12:46, 1.18s/it]  ← en cours
```

**Observations** :
- GPU correctement détecté (cuda, 2 GPUs)
- Dataset chargé avec succès depuis HuggingFace
- Entraînement en cours à ~1.18 secondes par batch

**Warnings non-bloquants** :
- `FutureWarning: torch.cuda.amp.GradScaler deprecated` → avertissement de dépréciation PyTorch, sans impact sur le fonctionnement.
- `FutureWarning: torch.cuda.amp.autocast deprecated` → même nature, sans impact.

---

## 7. Métriques d'évaluation

### Recall@K

Le **Recall@K** est la métrique principale utilisée pour évaluer la qualité de la recherche.

**Définition** : Pour chaque image du test set, on encode sa légende comme requête texte. On cherche dans toute la base de données. Est-ce que l'image correspondante apparaît dans les K premiers résultats ?

```
Recall@1  = l'image exacte est le 1er résultat
Recall@5  = l'image exacte est dans les 5 premiers résultats
Recall@10 = l'image exacte est dans les 10 premiers résultats
```

**Exemple concret** :
```
Requête : "chest X-ray showing cardiomegaly"
Base    : 9 927 images

Recall@1  : 45% → dans 45% des cas, la bonne image est en 1ère position
Recall@5  : 72% → dans 72% des cas, dans le top 5
Recall@10 : 83% → dans 83% des cas, dans le top 10
```

*Les valeurs ci-dessus sont des estimations avant résultats réels.*

---

## 8. Résultats attendus

Les résultats réels (Recall@K avant et après fine-tuning) seront disponibles à la fin de l'entraînement. Le notebook calculera automatiquement :

```
--- AVANT fine-tuning ---
  Recall@1  : xx.xx%
  Recall@5  : xx.xx%
  Recall@10 : xx.xx%

--- APRÈS fine-tuning ---
  Recall@1  : xx.xx%
  Recall@5  : xx.xx%
  Recall@10 : xx.xx%

--- Amélioration ---
  Recall@1  : +x.xx%
  Recall@5  : +x.xx%
  Recall@10 : +x.xx%
```

*Ce tableau sera complété après la fin de l'entraînement.*

---

## 9. Étape suivante : intégrer le modèle dans MediScan

Une fois l'entraînement terminé, le modèle fine-tuné sera uploadé sur HuggingFace Hub à l'adresse :

```
https://huggingface.co/Ozantsk/biomedclip-rocov2-finetuned
```

Il faudra ensuite modifier MediScan pour charger ce modèle à la place de BiomedCLIP original :

```python
# Avant
model = "hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224"

# Après
model = "hf-hub:Ozantsk/biomedclip-rocov2-finetuned"
```

---

## 10. Glossaire

| Terme | Définition simple |
|---|---|
| Fine-tuning | Ré-entraîner un modèle existant sur un dataset spécifique pour l'améliorer dans un domaine précis |
| Epoch | Une passe complète sur toutes les images du dataset d'entraînement |
| Batch | Groupe d'images traitées en même temps (ici 64 images) |
| Loss | Mesure de l'erreur du modèle. Plus elle est basse, mieux c'est |
| Recall@K | Pourcentage de cas où la bonne réponse est dans les K premiers résultats |
| Early stopping | Arrêt automatique de l'entraînement quand le modèle cesse de s'améliorer |
| Overfitting | Le modèle mémorise les données d'entraînement au lieu d'apprendre à généraliser |
| Learning rate | Vitesse à laquelle le modèle modifie ses paramètres à chaque étape |
| GPU | Processeur graphique, beaucoup plus rapide que le CPU pour les calculs d'IA |
| Embedding / Vecteur | Représentation numérique d'une image ou d'un texte (liste de nombres) |
| Mixed precision (fp16) | Technique pour accélérer l'entraînement en utilisant des nombres moins précis |

---

*Document à compléter avec les résultats finaux après la fin de l'entraînement.*
