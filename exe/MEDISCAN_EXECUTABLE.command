#!/usr/bin/env bash
# Executable local MediScan AI pour macOS et Linux.

set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

if [ ! -x "./run.sh" ]; then
    chmod +x ./run.sh 2>/dev/null || true
fi

./run.sh
