#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON_BIN="${DOCS_PYTHON:-python3.11}"
VENV_DIR="$ROOT_DIR/.venv-docx"
REQ_FILE="$ROOT_DIR/tools/docx-validator/requirements-lock.txt"
WHEEL_DIR="$ROOT_DIR/tools/docx-validator/wheels"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "[ERROR] Python interpreter not found: $PYTHON_BIN"
  echo "[HINT] Install Python 3.11 and rerun: DOCS_PYTHON=python3.11 make docs:bootstrap"
  exit 1
fi

PY_VER="$($PYTHON_BIN -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
if [[ "$PY_VER" != "3.11" ]]; then
  echo "[ERROR] DOCS_PYTHON must be Python 3.11, got: $PY_VER"
  echo "[HINT] Use DOCS_PYTHON=python3.11"
  exit 1
fi

if [[ ! -f "$REQ_FILE" ]]; then
  echo "[ERROR] Missing requirements lock file: $REQ_FILE"
  exit 1
fi

if [[ ! -d "$WHEEL_DIR" ]]; then
  echo "[ERROR] Missing wheelhouse directory: $WHEEL_DIR"
  exit 1
fi

if ! find "$WHEEL_DIR" -maxdepth 1 -type f -name '*.whl' | grep -q .; then
  echo "[ERROR] Wheelhouse is empty: $WHEEL_DIR"
  echo "[HINT] Prebuild wheels in a networked environment and copy them into tools/docx-validator/wheels/"
  exit 1
fi

echo "[INFO] Creating docx validator venv: $VENV_DIR"
"$PYTHON_BIN" -m venv "$VENV_DIR"

"$VENV_DIR/bin/python" -m pip install --no-index --find-links "$WHEEL_DIR" -r "$REQ_FILE"

"$VENV_DIR/bin/python" - <<'PY'
import importlib
for module in ("lxml.etree", "defusedxml.minidom"):
    importlib.import_module(module)
print("deps_ok")
PY

echo "[INFO] docx validator runtime is ready"
