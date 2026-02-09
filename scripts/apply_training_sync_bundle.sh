#!/usr/bin/env bash
# Apply a training sync bundle after integrity verification, with backup and post-checks.
# Usage:
#   bash scripts/apply_training_sync_bundle.sh --bundle /root/autodl-tmp/training_sync_bundle_xxx.tar.gz
#   bash scripts/apply_training_sync_bundle.sh --staging-dir /root/autodl-tmp/training_sync_staging/training_sync_bundle_xxx

set -euo pipefail

PROJECT_ROOT="/root/graduationDesign"
BACKUP_ROOT="/root/autodl-tmp/sync_backup"
BUNDLE_PATH=""
STAGING_DIR=""
KEEP_STAGING=0
MANIFEST_PATH=""
MANIFEST_BASENAME=""
HASH_MODE=""

verify_manifest_file() {
    local mode=$1
    local manifest=$2
    if [ "$mode" = "sha256" ]; then
        if command -v sha256sum >/dev/null 2>&1; then
            sha256sum -c "$manifest"
        elif command -v shasum >/dev/null 2>&1; then
            shasum -a 256 -c "$manifest"
        else
            echo "[ERROR] Neither sha256sum nor shasum is available."
            exit 1
        fi
    elif [ "$mode" = "sha1" ]; then
        if command -v sha1sum >/dev/null 2>&1; then
            sha1sum -c "$manifest"
        elif command -v shasum >/dev/null 2>&1; then
            shasum -a 1 -c "$manifest"
        else
            echo "[ERROR] Neither sha1sum nor shasum is available."
            exit 1
        fi
    else
        echo "[ERROR] Unknown hash mode: $mode"
        exit 1
    fi
}

usage() {
    cat <<'EOF'
Usage:
  bash scripts/apply_training_sync_bundle.sh --bundle <bundle.tar.gz> [--project-root <path>] [--backup-root <path>] [--keep-staging]
  bash scripts/apply_training_sync_bundle.sh --staging-dir <extracted_dir> [--project-root <path>] [--backup-root <path>]

Notes:
  - Exactly one of --bundle or --staging-dir is required.
  - Preferred manifest is SYNC_MANIFEST.sha256.
  - Legacy SYNC_MANIFEST.txt is supported (sha1/sha256 is auto-detected by hash length).
EOF
}

while [ $# -gt 0 ]; do
    case "$1" in
      --bundle)
        BUNDLE_PATH=${2:-}
        shift 2
        ;;
      --staging-dir)
        STAGING_DIR=${2:-}
        shift 2
        ;;
      --project-root)
        PROJECT_ROOT=${2:-}
        shift 2
        ;;
      --backup-root)
        BACKUP_ROOT=${2:-}
        shift 2
        ;;
      --keep-staging)
        KEEP_STAGING=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "[ERROR] Unknown argument: $1"
        usage
        exit 1
        ;;
    esac
done

if [ -n "$BUNDLE_PATH" ] && [ -n "$STAGING_DIR" ]; then
    echo "[ERROR] --bundle and --staging-dir are mutually exclusive."
    exit 1
fi

if [ -z "$BUNDLE_PATH" ] && [ -z "$STAGING_DIR" ]; then
    echo "[ERROR] One of --bundle or --staging-dir must be provided."
    exit 1
fi

if [ -n "$BUNDLE_PATH" ]; then
    if [ ! -f "$BUNDLE_PATH" ]; then
        echo "[ERROR] Bundle not found: $BUNDLE_PATH"
        exit 1
    fi
    bundle_base="$(basename "$BUNDLE_PATH" .tar.gz)"
    STAGING_DIR="/root/autodl-tmp/training_sync_staging/${bundle_base}_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$STAGING_DIR"
    tar -xzf "$BUNDLE_PATH" -C "$STAGING_DIR"
fi

if [ ! -d "$STAGING_DIR" ]; then
    echo "[ERROR] Staging directory not found: $STAGING_DIR"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT" ]; then
    echo "[ERROR] Project root not found: $PROJECT_ROOT"
    exit 1
fi

if [ -f "$STAGING_DIR/SYNC_MANIFEST.sha256" ]; then
    MANIFEST_PATH="$STAGING_DIR/SYNC_MANIFEST.sha256"
    MANIFEST_BASENAME="SYNC_MANIFEST.sha256"
    HASH_MODE="sha256"
elif [ -f "$STAGING_DIR/SYNC_MANIFEST.txt" ]; then
    MANIFEST_PATH="$STAGING_DIR/SYNC_MANIFEST.txt"
    MANIFEST_BASENAME="SYNC_MANIFEST.txt"
    first_hash=$(awk 'NR==1 {print $1}' "$MANIFEST_PATH")
    hash_len=${#first_hash}
    if [ "$hash_len" -eq 64 ]; then
        HASH_MODE="sha256"
    elif [ "$hash_len" -eq 40 ]; then
        HASH_MODE="sha1"
    else
        echo "[ERROR] Unable to detect hash mode from legacy manifest: $MANIFEST_PATH"
        echo "        first hash length=$hash_len, expected 64 (sha256) or 40 (sha1)"
        exit 1
    fi
else
    echo "[ERROR] Missing manifest in staging: expected SYNC_MANIFEST.sha256 or SYNC_MANIFEST.txt"
    exit 1
fi

echo "[INFO] Verifying staging integrity via $MANIFEST_BASENAME ($HASH_MODE) ..."
(
    cd "$STAGING_DIR"
    verify_manifest_file "$HASH_MODE" "$MANIFEST_BASENAME"
)

BACKUP_DIR="$BACKUP_ROOT/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "[INFO] Backing up current files to: $BACKUP_DIR"
while IFS= read -r manifest_line || [ -n "$manifest_line" ]; do
    [ -z "$manifest_line" ] && continue
    rel_path=$(printf '%s\n' "$manifest_line" | awk '{print $2}')
    if [ -z "$rel_path" ]; then
        echo "[ERROR] Invalid manifest line: $manifest_line"
        exit 1
    fi
    src_path="$PROJECT_ROOT/$rel_path"
    if [ -e "$src_path" ] || [ -L "$src_path" ]; then
        mkdir -p "$BACKUP_DIR/$(dirname "$rel_path")"
        cp -a "$src_path" "$BACKUP_DIR/$rel_path"
    fi
done < "$MANIFEST_PATH"

echo "[INFO] Applying synced files to project root: $PROJECT_ROOT"
while IFS= read -r manifest_line || [ -n "$manifest_line" ]; do
    [ -z "$manifest_line" ] && continue
    rel_path=$(printf '%s\n' "$manifest_line" | awk '{print $2}')
    src_path="$STAGING_DIR/$rel_path"
    dst_path="$PROJECT_ROOT/$rel_path"
    if [ ! -f "$src_path" ]; then
        echo "[ERROR] File listed in manifest is missing from staging: $rel_path"
        exit 1
    fi
    mkdir -p "$PROJECT_ROOT/$(dirname "$rel_path")"
    cp -a "$src_path" "$dst_path"
done < "$MANIFEST_PATH"

for executable in \
    "$PROJECT_ROOT/scripts/remote_train_all.sh" \
    "$PROJECT_ROOT/scripts/verify_training_ready.sh" \
    "$PROJECT_ROOT/scripts/build_training_sync_bundle.sh" \
    "$PROJECT_ROOT/scripts/apply_training_sync_bundle.sh" \
    "$PROJECT_ROOT/code/ai_service/training/run_train.sh"; do
    if [ -f "$executable" ]; then
        chmod +x "$executable"
    fi
done

echo "[INFO] Running post-apply checks ..."
if ! grep -q "writing)" "$PROJECT_ROOT/code/ai_service/training/run_train.sh"; then
    echo "[ERROR] run_train.sh does not include writing stage after apply."
    exit 1
fi

check_line_count() {
    local rel_path=$1
    local expected=$2
    local full_path="$PROJECT_ROOT/$rel_path"
    if [ ! -f "$full_path" ]; then
        echo "[ERROR] Missing file after apply: $rel_path"
        exit 1
    fi
    local actual
    actual=$(wc -l < "$full_path" | tr -d '[:space:]')
    if [ "$actual" != "$expected" ]; then
        echo "[ERROR] Unexpected line count for $rel_path (expected=$expected actual=$actual)"
        exit 1
    fi
    echo "[OK] $rel_path line count: $actual"
}

check_line_count "data/training/processed/writing_sft.jsonl" "12"
check_line_count "data/training/eval/style_benchmark.jsonl" "11"
check_line_count "data/training/eval/writing_benchmark.jsonl" "6"

echo "[OK] Sync apply finished successfully."
echo "[OK] Backup saved at: $BACKUP_DIR"
echo "[OK] Staging dir: $STAGING_DIR"

if [ "$KEEP_STAGING" -ne 1 ] && [ -n "$BUNDLE_PATH" ]; then
    rm -rf "$STAGING_DIR"
    echo "[OK] Cleaned temporary staging: $STAGING_DIR"
fi
