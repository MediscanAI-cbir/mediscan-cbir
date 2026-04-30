# MEDISCAN AI

<p align="center">
  <strong>English</strong> · <a href="READMEfr.md">Français</a> · <a href="COMMAND.md">Commands</a>
</p>

<div align="center">
  <img src="frontend/public/Logo-2.svg" alt="MEDISCAN AI logo" width="120" />

  <h3>Multimodal medical image retrieval platform.</h3>

  <p>
    MEDISCAN AI makes it possible to search, compare and explore medical images from an image, a text query or a semantic representation.
  </p>

  <p>
    <strong>Non-clinical academic prototype.</strong><br />
    This repository is built to experiment with a medical image retrieval system. It must not be used as a medical device or as a diagnostic tool.
  </p>

  <p>
    <img alt="Deep Learning" src="https://img.shields.io/badge/Deep_Learning-core-6B7280?style=for-the-badge&labelColor=EE4C2C" />
    <img alt="Transformers" src="https://img.shields.io/badge/Transformers-multimodal-6B7280?style=for-the-badge&labelColor=F59E0B" />
    <img alt="Fine-tuning" src="https://img.shields.io/badge/Fine--tuning-domain_adaptation-6B7280?style=for-the-badge&labelColor=7C3AED" />
    <img alt="Medical Images" src="https://img.shields.io/badge/Medical_Images-retrieval-6B7280?style=for-the-badge&labelColor=0F766E" />
    <img alt="Artificial Intelligence" src="https://img.shields.io/badge/Artificial_Intelligence-end_to_end-6B7280?style=for-the-badge&labelColor=1F2937" />
    <img alt="DINOv2" src="https://img.shields.io/badge/DINOv2-self--supervised-6B7280?style=for-the-badge&labelColor=111827" />
    <img alt="BioMedCLIP" src="https://img.shields.io/badge/BioMedCLIP-transformer_based-6B7280?style=for-the-badge&labelColor=2563EB" />
    <img alt="Kaggle" src="https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white" />
  </p>

  <h3>Technical Stack</h3>

  <table border="1" cellpadding="16" cellspacing="0">
    <tr>
      <td width="33%" valign="top" align="center">
        <h4>CBIR / AI Core</h4>
        <p><sub>Embeddings, indexing and multimodal retrieval</sub></p>
        <p align="center">
          <img alt="PyTorch" height="28" align="middle" src="https://cdn.simpleicons.org/pytorch/EE4C2C" />&nbsp;&nbsp;<strong>PyTorch</strong><br /><br />
          <img alt="Hugging Face" height="28" align="middle" src="https://cdn.simpleicons.org/huggingface/FFD21E" />&nbsp;&nbsp;<strong>BioMedCLIP / Hugging Face</strong><br /><br />
          <img alt="Meta" height="28" align="middle" src="https://cdn.simpleicons.org/meta/0467DF" />&nbsp;&nbsp;<strong>DINOv2 / FAISS</strong><br /><br />
          <img alt="Kaggle" height="28" align="middle" src="https://cdn.simpleicons.org/kaggle/20BEFF" />&nbsp;&nbsp;<strong>ROCOv2 / datasets</strong>
        </p>
      </td>
      <td width="33%" valign="top" align="center">
        <h4>Backend / API</h4>
        <p><sub>Services, validation, orchestration and synthesis</sub></p>
        <p align="center">
          <img alt="Python" height="28" align="middle" src="https://cdn.simpleicons.org/python/3776AB" />&nbsp;&nbsp;<strong>Python 3.11</strong><br /><br />
          <img alt="FastAPI" height="28" align="middle" src="https://cdn.simpleicons.org/fastapi/009688" />&nbsp;&nbsp;<strong>FastAPI</strong><br /><br />
          <img alt="MongoDB" height="28" align="middle" src="https://cdn.simpleicons.org/mongodb/47A248" />&nbsp;&nbsp;<strong>MongoDB / PyMongo</strong><br /><br />
          <img alt="Groq" height="28" align="middle" src="https://groq.com/favicon.svg" />&nbsp;&nbsp;<strong>Groq Cloud</strong>
        </p>
      </td>
      <td width="33%" valign="top" align="center">
        <h4>Frontend / Product</h4>
        <p><sub>Interface, user flows and GitHub demo</sub></p>
        <p align="center">
          <img alt="React" height="28" align="middle" src="https://cdn.simpleicons.org/react/61DAFB" />&nbsp;&nbsp;<strong>React 19</strong><br /><br />
          <img alt="Vite" height="28" align="middle" src="https://cdn.simpleicons.org/vite/646CFF" />&nbsp;&nbsp;<strong>Vite</strong><br /><br />
          <img alt="Tailwind CSS" height="28" align="middle" src="https://cdn.simpleicons.org/tailwindcss/06B6D4" />&nbsp;&nbsp;<strong>Tailwind CSS</strong><br /><br />
          <img alt="Vitest" height="28" align="middle" src="https://cdn.simpleicons.org/vitest/6E9F18" />&nbsp;&nbsp;<strong>Vitest / Pytest</strong>
        </p>
      </td>
    </tr>
  </table>

  <p>
    <small><strong>Other building blocks:</strong> Uvicorn, NumPy, Pillow, OpenCLIP, evaluation scripts and versioned FAISS artifacts.</small>
  </p>

  <p>
    <strong>Top contributors</strong>
  </p>

  <p>
    <a href="https://github.com/OzanTaskin" title="OzanTaskin">
      <img src="https://avatars.githubusercontent.com/u/198925800?v=4" alt="OzanTaskin" width="64" height="64" style="border-radius: 50%;" />
    </a>
    <a href="https://github.com/Somixe" title="Somixe">
      <img src="https://avatars.githubusercontent.com/u/189563390?v=4" alt="Somixe" width="64" height="64" style="border-radius: 50%;" />
    </a>
    <a href="https://github.com/ales-frhn" title="ales-frhn">
      <img src="https://avatars.githubusercontent.com/u/238909877?v=4" alt="ales-frhn" width="64" height="64" style="border-radius: 50%;" />
    </a>
    <a href="https://github.com/RayaneWebDev" title="RayaneWebDev">
      <img src="https://avatars.githubusercontent.com/u/182266761?v=4" alt="RayaneWebDev" width="64" height="64" style="border-radius: 50%;" />
    </a>
  </p>
</div>

## Table of Contents

- [Overview](#overview)
- [Documentation](#documentation)
- [Application Demo](#application-demo)
- [1. Features](#1-features)
  - [1.1 Overview](#11-overview)
  - [1.2 Search Modes](#12-search-modes)
  - [1.3 Main Features](#13-main-features)
  - [1.4 Highlighted Features](#14-highlighted-features)
- [2. Technical Architecture](#2-technical-architecture)
  - [2.1 Overview](#21-overview)
  - [2.2 Why DINOv2 and BioMedCLIP](#22-why-dinov2-and-biomedclip)
  - [2.3 Fine-tuning BioMedCLIP on ROCOv2](#23-fine-tuning-biomedclip-on-rocov2)
  - [2.4 Search Pipeline](#24-search-pipeline)
  - [2.5 Backend API](#25-backend-api)
  - [2.6 API Contracts](#26-api-contracts)
  - [2.7 Evaluation and Proofs](#27-evaluation-and-proofs)
- [3. Run and Relaunch Locally](#3-run-and-relaunch-locally)
- [4. Project Structure](#4-project-structure)
- [Known Limitations](#known-limitations)
- [License](#license)
- [Disclaimer](#disclaimer)

## Overview

> This section introduces the project, its general objective and the three ways to query the medical image database.

MEDISCAN AI is an academic prototype dedicated to medical image retrieval. The application can query an image database from a reference image, a text query or a semantic representation.

The project explores the use of visual and multimodal models to browse a collection of medical images. The application brings together upload, result display, filters, comparison, search relaunch and assisted synthesis.

The project covers four areas:

- fast exploration of medical image databases;
- visual and semantic comparison of results;
- a user interface around an AI retrieval engine;
- locally executable code with frontend, backend, indexes and evaluation scripts.

By combining image search, text search, multimodal models and a user interface, MEDISCAN AI shows how to organize an end-to-end medical retrieval system.

Three types of search are available:

- image-based search, to retrieve visually similar images;
- semantic search, to identify medically related images;
- text-based search, to retrieve images matching a description or clinical intent.

## Documentation

The project documentation can be generated as a single local portal:

```bash
python scripts/generate_docs.py
```

Or through the project shell shortcut:

```bash
./bin/run.sh docs
```

The generated portal is located here:

```text
docs/index.html
```

## Application Demo

> This section shows the real user flow, from choosing the search mode to assisted synthesis.

[Watch the demo video on YouTube](https://youtu.be/sy-FLL0Jk4w)

![MEDISCAN AI application demo](docs/assets/readme/mediscanai-product-demo.gif)

The video shows a usage scenario:

1. Choose the search mode.
2. Upload a medical image or enter a text query.
3. Display the results.
4. Explore and compare images.
5. Relaunch a search from one or more results.
6. Generate an LLM-assisted synthesis.

## 1. Features

> This section summarizes the main actions available in the interface.

### 1.1 Overview

> This subsection presents the general user-side workflow.

MEDISCAN AI makes it possible to search, compare and explore medical images without directly manipulating models or indexes.

**Main actions:**

- search by image or by text;
- browse, filter and inspect results;
- relaunch a search from one result or a selection;
- generate an assisted synthesis and present the results.

The interface sends requests to the backend, receives ranked results and displays useful metadata.

### 1.2 Search Modes

> This subsection presents the three ways to query the database.

<table border="1" cellpadding="12" cellspacing="0">
  <tr>
    <td width="33%" valign="top">
      <img alt="Visual Analysis" width="300" height="34" src="docs/assets/readme/badge-visual-analysis.svg" />
      <br /><br />
      <strong>Visual similarity</strong><br />
      Input: medical image<br />
      Result: images close in appearance.
    </td>
    <td width="33%" valign="top">
      <img alt="Interpretive Analysis" width="300" height="34" src="docs/assets/readme/badge-interpretive-analysis.svg" />
      <br /><br />
      <strong>Semantic proximity</strong><br />
      Input: medical image<br />
      Result: images close in medical meaning.
    </td>
    <td width="33%" valign="top">
      <img alt="Text Query" width="300" height="34" src="docs/assets/readme/badge-text-query.svg" />
      <br /><br />
      <strong>Description-based search</strong><br />
      Input: text query<br />
      Result: images aligned with the text.
    </td>
  </tr>
</table>

### 1.3 Main Features

> This subsection groups features by major families.

<table border="1" cellpadding="14" cellspacing="0">
  <tr>
    <td width="50%" valign="top">
      <img alt="Search and exploration" width="300" height="34" src="docs/assets/readme/badge-recherche-exploration.svg" />
      <br /><br />
      <strong>Medical image upload</strong><br />
      Import a reference image.
      <br /><br />
      <strong>Visual, semantic and text-to-image search</strong><br />
      Three modes to explore the database.
      <br /><br />
      <strong>Filters and categories</strong><br />
      Refinement by score, caption, CUI, medical type or reference.
    </td>
    <td width="50%" valign="top">
      <img alt="Analysis" width="300" height="34" src="docs/assets/readme/badge-analyse.svg" />
      <br /><br />
      <strong>Results grid</strong><br />
      Ranked, paginated results that are easy to compare.
      <br /><br />
      <strong>Detail view</strong><br />
      Inspect an image with its useful information.
      <br /><br />
      <strong>Relaunch from one or more results</strong><br />
      Start a new search from one result or a selection.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img alt="Assisted synthesis" width="300" height="34" src="docs/assets/readme/badge-synthese-assistee.svg" />
      <br /><br />
      <strong>LLM-assisted conclusion</strong><br />
      Exploratory summary generated from the results.
      <br /><br />
      <strong>Export and sharing</strong><br />
      Present results for comparison, review or demonstration.
    </td>
    <td width="50%" valign="top">
      <img alt="Interface" width="300" height="34" src="docs/assets/readme/badge-experience-produit.svg" />
      <br /><br />
      <strong>Bilingual interface</strong><br />
      Browse in multiple languages.
      <br /><br />
      <strong>Light / dark theme</strong><br />
      Visual adaptation to the usage context.
      <br /><br />
      <strong>User journey</strong><br />
      Continuous workflow from upload to synthesis.
    </td>
  </tr>
</table>

### 1.4 Highlighted Features

> This subsection details the key steps of the exploration workflow.

#### 1. Paginated Results Grid

After a search, images are displayed in a paginated grid ranked by similarity. Each result shows the essential information: rank, image, score, caption and identifier.

#### 2. Result Filters

Filters refine the list already returned by the search engine. They do not recompute embeddings: they reduce or organize the visible results.

Main filters:

- **caption and suggestions**: search for terms inside captions and suggest useful words;
- **CUI and medical type**: filter by UMLS concepts, anatomy, modality or finding;
- **score and sorting**: minimum threshold and result order;
- **image reference**: targeted search for a precise identifier, for example `ROCO_000123`.

In practice, a user can start from a broad search, choose a medical category, then refine with a term extracted from captions and a minimum score.

#### 3. Search Relaunch

Relaunching turns an interesting result, or a selection of several images, into a new query. With a multi-image selection, embeddings are averaged to represent the shared trend of the group.

Use cases:

- go deeper after finding a relevant image;
- search for cases close to a group of similar images;
- move from broad exploration to a more targeted search.

#### 4. LLM Conclusion

The LLM conclusion generates a cautious synthesis from the captions of similar images. It helps summarize recurring patterns without making a diagnosis or replacing medical advice. It requires a Groq key configured in `.env`.

#### 5. Export and Sharing

Results can be kept or shared to preserve the exploration trace, prepare a comparison or present a selection. This output is not a medical report.

## 2. Technical Architecture

> This section explains how MEDISCAN AI combines frontend, backend, embedding models, FAISS indexes, API and evaluation proofs.

### 2.1 Overview

MEDISCAN AI is organized as a complete application, not as a simple notebook. The React interface sends an image, text or relaunch request to the FastAPI backend. The backend validates the request, loads resources through a shared registry, encodes the query with the correct model, queries FAISS, enriches results and returns a JSON response usable by the interface.

```mermaid
%%{init: {"theme": "base", "flowchart": {"htmlLabels": true, "nodeSpacing": 60, "rankSpacing": 78, "diagramPadding": 24, "curve": "linear"}, "themeVariables": {"darkMode": true, "fontFamily": "Inter, Arial, sans-serif", "fontSize": "16px", "background": "#101010", "primaryColor": "#252525", "primaryTextColor": "#f2f2f2", "primaryBorderColor": "#8a8a8a", "lineColor": "#b8b8b8", "clusterBkg": "#171717", "clusterBorder": "#777777", "edgeLabelBackground": "#101010"}}}%%
flowchart LR
  USER["User<br/>image, text or relaunch"] --> UI["React / Vite frontend"]
  UI <-->|HTTP JSON| API["FastAPI backend"]
  API --> SERVICE["SearchService<br/>validation + orchestration"]
  SERVICE --> REGISTRY["ResourceRegistry<br/>lazy loading + thread-safe"]
  REGISTRY --> VISUAL["DINOv2<br/>visual FAISS index"]
  REGISTRY --> SEMANTIC["fine-tuned BioMedCLIP<br/>semantic FAISS index"]
  SERVICE --> RESULTS["Enriched results<br/>score, image_id, caption, CUI"]
  RESULTS --> UI
  SERVICE -.-> LLM["Groq LLM<br/>optional synthesis"]
  SERVICE -.-> MONGO["MongoDB<br/>optional enrichment"]
```

Stable resources are separated from the runtime. FAISS files and metadata live in `artifacts/`, search code in `src/mediscan/`, the API in `backend/app/`, and the product interface in `frontend/`.

| Resource | Role |
|---|---|
| `artifacts/index.faiss` | DINOv2 visual index, dimension `768` |
| `artifacts/ids.json` | Metadata aligned with the visual index |
| `artifacts/index_semantic.faiss` | BioMedCLIP semantic index, dimension `512` |
| `artifacts/ids_semantic.json` | Metadata aligned with the semantic index |
| `artifacts/manifests/*.json` | Verification of model, dimension, vector count and status |

The `.faiss` files are large and must be fetched with Git LFS after cloning:

```bash
git lfs install
git lfs pull
```

### 2.2 Why DINOv2 and BioMedCLIP

MEDISCAN AI uses two embedding families because a single representation does not answer every medical retrieval use case correctly.

| User need | Model | Why |
|---|---|---|
| Find images that look visually similar | DINOv2 | Strong for structure, texture, shapes, contrast and visual neighborhoods. |
| Find images close in medical meaning | BioMedCLIP | Aligns medical images and language in a shared space, better suited to the clinical meaning of captions. |
| Start from a text query | BioMedCLIP | Encodes text and images in the same vector space, enabling text-to-image retrieval. |

DINOv2 is used for **Visual Analysis**. It answers a direct question: "which images look like this one?" It is the right choice when appearance, morphology and image structure are the main signals.

BioMedCLIP is used for **Interpretive Analysis** and **Text Query**. It answers another question: "which images carry a similar medical meaning?" This is necessary when the query comes from text, a caption, medical vocabulary or an interpretation that is more semantic than purely visual.

The three modes therefore use different indexes, but follow the same retrieval principle:

| Mode | Input | Encoder | Index | Goal |
|---|---|---|---|---|
| Visual Analysis | Medical image | `dinov2_base` | `artifacts/index.faiss` | Visual similarity |
| Interpretive Analysis | Medical image | fine-tuned `biomedclip` | `artifacts/index_semantic.faiss` | Medical semantic similarity |
| Text Query | Medical text | fine-tuned `biomedclip` | `artifacts/index_semantic.faiss` | Text to image |

### 2.3 Fine-tuning BioMedCLIP on ROCOv2

The semantic branch uses a BioMedCLIP checkpoint adapted to the project domain:

```text
hf-hub:Ozantsk/biomedclip-rocov2-finetuned
```

BioMedCLIP already provides a shared image/text space. Fine-tuning brings that space closer to the dataset actually used by MEDISCAN AI: ROCOv2 images, medical captions, imaging modalities, anatomy, findings and corpus-specific phrasing.

The fine-tuned model is used for two operations:

- encoding images into `artifacts/index_semantic.faiss`;
- encoding image or text queries at search time.

The important point is consistency between the model and the index. The semantic index was rebuilt with embeddings from the fine-tuned model, then queried with the same model at runtime.

```text
fine-tuned BioMedCLIP ROCOv2
  |
  +-- encodes dataset images
  |
  +-- builds artifacts/index_semantic.faiss
  |
  +-- also encodes image and text queries at runtime
```

Without this consistency, FAISS would compare vectors produced by different spaces, making distances hard to interpret. Here, indexed images and queries live in the same vector space.

### 2.4 Search Pipeline

The pipeline follows the same overall logic for image search, text search, ID search and multi-selection search. Only the encoding method changes.

```text
1. User request
   uploaded image, medical text, image_id or list of image_id values

2. Backend validation
   image format, mode, size, non-empty text, k between 1 and 50

3. Encoding
   DINOv2 for Visual Analysis
   BioMedCLIP image encoder for Interpretive Analysis
   BioMedCLIP text encoder for Text Query

4. Normalization
   L2-normalized float32 vectors

5. FAISS search
   top-k neighbors, optional source exclusion, centroid if several images

6. Enrichment
   image_id, score, caption, CUI, public path or image redirect

7. API response
   structured JSON displayed in the React grid
```

Multi-image relaunch computes a centroid: embeddings from selected images are averaged, normalized, then used as the new FAISS query. This turns several interesting results into a more stable search intent.

### 2.5 Backend API

The FastAPI backend exposes an API centered on search, relaunch, image access, assisted synthesis and contact.

| Endpoint | Method | Role |
|---|---|---|
| `/api/health` | `GET` | Checks that the backend responds |
| `/api/ready` | `GET` | Checks artifacts, IDs and optional service status |
| `/api/search` | `POST` | Search from an uploaded image, in `visual` or `semantic` mode |
| `/api/search-text` | `POST` | Text-to-image search through fine-tuned BioMedCLIP |
| `/api/search-by-id` | `POST` | Relaunch a search from an already indexed image |
| `/api/search-by-ids` | `POST` | Centroid relaunch from several selected images |
| `/api/generate-conclusion` | `POST` | Generate a cautious synthesis from results |
| `/api/contact` | `POST` | Send a message if SMTP is configured |
| `/api/images/{image_id}` | `GET` | Redirect to the public ROCOv2 image |

Search routes share the same safeguards: maximum upload size, MIME type validation, `k` limit, mode normalization, concurrency limits and rate limiting configurable through environment variables.

### 2.6 API Contracts

Endpoints return JSON responses validated on the backend side. Results follow a shared structure:

```json
{
  "mode": "visual",
  "embedder": "dinov2_base",
  "results": [
    {
      "rank": 1,
      "image_id": "ROCOv2_2023_train_000001",
      "score": 0.823,
      "path": "https://huggingface.co/datasets/Mediscan-Team/mediscan-data/resolve/main/images_01/ROCOv2_2023_train_000001.png",
      "caption": "Medical image caption",
      "cui": "C000000"
    }
  ]
}
```

Search from an uploaded image:

```bash
curl -X POST http://127.0.0.1:8000/api/search \
  -F "image=@query.png" \
  -F "mode=visual" \
  -F "k=5"
```

Text-to-image search:

```http
POST /api/search-text
{
  "text": "chest X-ray with bilateral lower lobe opacities",
  "k": 10
}
```

Relaunch from an indexed image:

```http
POST /api/search-by-id
{
  "image_id": "ROCOv2_2023_train_000123",
  "mode": "semantic",
  "k": 10
}
```

Relaunch from several images:

```http
POST /api/search-by-ids
{
  "image_ids": [
    "ROCOv2_2023_train_000123",
    "ROCOv2_2023_train_000124"
  ],
  "mode": "visual",
  "k": 10
}
```

Assisted synthesis:

```http
POST /api/generate-conclusion
{
  "mode": "semantic",
  "embedder": "biomedclip",
  "results": [
    {
      "rank": 1,
      "image_id": "ROCOv2_2023_train_000123",
      "score": 0.82,
      "caption": "Medical caption"
    }
  ]
}
```

Common error codes:

| Code | Typical case |
|---:|---|
| `400` | Unknown mode, invalid image, empty text, incorrect identifier |
| `413` | Uploaded image above configured limit |
| `502` | SMTP sending failed despite present configuration |
| `503` | Search resource, LLM synthesis or email unavailable |

### 2.7 Evaluation and Proofs

Evaluation proofs document retrieval behavior on controlled queries. Depending on how the repository is shared, CSV files in `proofs/perf/` may be versioned, provided separately or regenerated locally.

| Evaluation | Queries | Result |
|---|---:|---|
| Fine-tuned semantic strict, `k=10` | `9,140` | `TM queries 91.29%`, `TA queries 90.70%`, `TMO queries 88.88%` |
| Semantic strict baseline, `k=10` | `9,140` | `TM queries 90.97%`, `TA queries 90.40%`, `TMO queries 88.58%` |
| Text Query caption, `k=10` | `100` | `Precision@k 77.00%`, `Top-1 hit 100.00%` |
| Text Query keyword, `k=10` | `100` | `Precision@k 39.30%`, `Top-1 hit 86.00%` |

Abbreviations:

- `TM`: same modality;
- `TA`: same anatomy / organ;
- `TMO`: same modality and same organ.

Strict evaluations use local ground-truth files:

```text
artifacts/ground_truth/ROCOv2_GLOABL_modality.csv
artifacts/ground_truth/ROCOv2_GLOABL_organ.csv
artifacts/ground_truth/ROCOv2_GLOABL_mo.csv
```

These files make it possible to check whether results share the same modality, the same anatomy or the same modality-organ pair. Without these files, search remains usable, but strict evaluations cannot be reproduced as-is.

## 3. Run and Relaunch Locally

> This section explains local startup with the launchers in the `bin/` folder.

The project now provides dedicated launchers. They prepare the environment, install Python and frontend dependencies when needed, verify critical imports, start the FastAPI backend, wait for `/api/health`, then launch the Vite frontend.

| Platform | Launcher | Usage |
|---|---|---|
| macOS / Linux | `bin/run.sh` | Terminal launch |
| macOS | `bin/MEDISCAN_EXECUTABLE.command` | Double-click from Finder |
| Windows | `bin/run.bat` | Terminal or double-click launch |

Recommended prerequisites:

- Python `3.11`;
- Node.js `>=20.19.0` or `>=22.12.0`;
- npm;
- Git LFS to fetch FAISS indexes.

### 3.1 First Launch

After cloning the repository:

```bash
git lfs install
git lfs pull
```

macOS / Linux:

```bash
chmod +x bin/run.sh
./bin/run.sh
```

macOS double-click:

```text
bin/MEDISCAN_EXECUTABLE.command
```

Windows:

```bat
bin\run.bat
```

Once started:

| Service | URL |
|---|---|
| Frontend | `http://127.0.0.1:5173` |
| Backend | `http://127.0.0.1:8000` |
| Health check | `http://127.0.0.1:8000/api/health` |
| Readiness check | `http://127.0.0.1:8000/api/ready` |

### 3.2 Clean Relaunch

To relaunch the project, simply run the same launcher again. The scripts reuse `.venv311`, avoid unnecessary dependency reinstalls and free backend/frontend ports before restarting.

```bash
./bin/run.sh
```

```bat
bin\run.bat
```

Useful launcher commands:

| Command | Role |
|---|---|
| `./bin/run.sh check` | Check the environment without starting servers |
| `./bin/run.sh docs` | Generate the local portal `docs/index.html` |
| `./bin/run.sh run` | Explicitly start backend + frontend |
| `bin\run.bat check` | Same check on Windows |
| `bin\run.bat docs` | Generate documentation on Windows |
| `bin\run.bat run` | Explicitly start backend + frontend on Windows |

### 3.3 `.env` Configuration

The app can start without a root `.env` file. Create one only if you need optional services such as Groq synthesis, MongoDB enrichment, SMTP contact, or custom ports.

Main variables:

| Variable | Required | Role |
|---|---|---|
| `BACKEND_PORT` | No | FastAPI port, default `8000` |
| `MEDISCAN_CORS_ORIGINS` | No | Allowed frontend origins |
| `MEDISCAN_MAX_UPLOAD_BYTES` | No | Maximum uploaded image size |
| `MEDISCAN_REMOTE_IMAGE_TIMEOUT_SECONDS` | No | Timeout for remote images |
| `MEDISCAN_TORCH_THREADS` | No | Number of PyTorch CPU threads |
| `MONGO_URI` | No | Optional enrichment through MongoDB |
| `GROQ_KEY_API` | No | Enables Groq-assisted synthesis |
| `MEDISCAN_GROQ_MODEL` | No | Groq model used |
| `MEDISCAN_MAX_CONCLUSION_RESULTS` | No | Number of results sent to synthesis |
| `MEDISCAN_SMTP_*` | Yes for contact | SMTP configuration for the contact form |

Search works without `GROQ_KEY_API` and without `MONGO_URI`. Without a Groq key, only assisted synthesis is unavailable. Without SMTP, the contact form returns a controlled error instead of simulating a send.

Frontend variables can be created locally in `frontend/.env` if needed:

| Variable | Role |
|---|---|
| `VITE_API_BASE` | API prefix used by the frontend, default `/api` |
| `VITE_BACKEND_ORIGIN` | Backend origin used by the Vite proxy |

### 3.4 Developer Commands

Frontend only:

```bash
cd frontend
npm ci
npm run dev
npm run build
npm run lint
```

Backend only:

```bash
python3.11 -m venv .venv311
source .venv311/bin/activate
pip install -r requirements.lock.txt
PYTHONPATH=src uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

API checks:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/ready
```

Tests:

```bash
pytest
```

Evaluations:

```bash
PYTHONPATH=src python scripts/evaluation/evaluate_strict.py --mode semantic --k 10 --n-queries 9140 --seed 42
PYTHONPATH=src python scripts/evaluation/evaluate_text.py --mode both --k 10 --n-queries 100 --seed 42
```

Evaluations depend on stable indexes, metadata and, for strict evaluation, ground-truth files. They are heavier than unit tests and are mainly used to produce or verify retrieval proofs.

## 4. Project Structure

> This section summarizes repository organization and the role of the main folders.

```text
.
|-- backend/              FastAPI API, routes, services, validation
|-- frontend/             React / Vite interface
|-- src/mediscan/         Retrieval runtime, embedders, FAISS search
|-- artifacts/            FAISS indexes, IDs, stable manifests
|-- proofs/perf/          Evaluation proof CSV files
|-- scripts/              Index building, CLI queries, visualizations, evaluations
|-- tests/                Unit and API tests
`-- bin/                  macOS, Linux and Windows launchers
    |-- run.sh            macOS / Linux terminal launcher
    |-- run.bat           Windows launcher
    `-- MEDISCAN_EXECUTABLE.command  macOS double-click launcher
```

## Known Limitations

> This section clarifies prototype limitations, especially around formats, data, scores and medical interpretation.

MEDISCAN AI is designed for academic exploration and demonstration. Several limitations should be kept in mind:

| Topic | Limitation |
|---|---|
| Medical use | The system does not make diagnoses, recommend treatment or replace a healthcare professional. |
| Input formats | Upload accepts only JPEG or PNG images. DICOM ingestion is not implemented. |
| Upload size | The default limit is 10 MB, configurable with `MEDISCAN_MAX_UPLOAD_BYTES`. |
| Text query | Text is limited to 500 characters. Best results are expected with short, structured medical phrasing, ideally in English. |
| Multi-selection | Relaunch by selection accepts at most 20 images. |
| Score | The score is vector similarity, not a clinical probability or diagnostic certainty level. |
| Filters | Grid filters act after retrieval on already returned results. They do not rebuild the index or recompute embeddings. |
| Data | Results depend on the indexed dataset, captions, available CUI values and their possible biases. |
| CUI | CUI categories are used to filter and explore, but they are not complete clinical annotations. |
| LLM synthesis | Synthesis uses only captions from transmitted results. It may be unavailable if `GROQ_KEY_API` is not configured. |
| Contact | The form depends on SMTP configuration. Without SMTP, sending is rejected cleanly. |
| Uploaded file persistence | Uploaded images are processed in temporary files deleted after use. They are not automatically added to the dataset or indexes. |

## License

> This section states code reuse conditions.

The project is distributed under the MIT license.

## Disclaimer

MEDISCAN AI is a non-clinical academic prototype. It is intended for experimentation, retrieval research and interface design. It must not be used to establish a diagnosis, guide a medical decision or replace the judgment of a healthcare professional.
