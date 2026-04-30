# MEDISCAN AI Commands

<p align="center">
  <a href="README.md">English README</a> · <a href="READMEfr.md">README français</a>
</p>

## Quick Start

macOS / Linux:

```bash
git lfs install
git lfs pull
chmod +x bin/run.sh
./bin/run.sh
```

macOS double-click:

```text
bin/MEDISCAN_EXECUTABLE.command
```

Windows:

```bat
git lfs install
git lfs pull
bin\run.bat
```

## Launchers

| Command | Role |
|---|---|
| `./bin/run.sh` | Start backend and frontend on macOS / Linux |
| `./bin/run.sh check` | Check the environment without starting servers |
| `./bin/run.sh docs` | Generate `docs/index.html` |
| `bin\run.bat` | Start backend and frontend on Windows |
| `bin\run.bat check` | Check the environment on Windows |
| `bin\run.bat docs` | Generate documentation on Windows |

## Local URLs

| Service | URL |
|---|---|
| Frontend | `http://127.0.0.1:5173` |
| Backend | `http://127.0.0.1:8000` |
| Health check | `http://127.0.0.1:8000/api/health` |
| Readiness check | `http://127.0.0.1:8000/api/ready` |

## Developer Commands

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

Tests:

```bash
pytest
```

Evaluations:

```bash
PYTHONPATH=src python scripts/evaluation/evaluate_strict.py --mode semantic --k 10 --n-queries 9140 --seed 42
PYTHONPATH=src python scripts/evaluation/evaluate_text.py --mode both --k 10 --n-queries 100 --seed 42
```
