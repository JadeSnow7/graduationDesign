#!/usr/bin/env bash
# Build a training sync bundle with SHA256 manifest for remote auditing.
# Usage:
#   bash scripts/build_training_sync_bundle.sh
#   OUT_DIR=/tmp bash scripts/build_training_sync_bundle.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

hash256() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$@"
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$@"
    else
        echo "[ERROR] Neither sha256sum nor shasum is available."
        exit 1
    fi
}

WHITELIST_FILE=${WHITELIST_FILE:-scripts/training_sync_whitelist.txt}
OUT_DIR=${OUT_DIR:-outputs/training_sync/bundles}
TIMESTAMP=${TIMESTAMP:-$(date +%Y%m%d_%H%M%S)}
BUNDLE_NAME=${BUNDLE_NAME:-training_sync_bundle_${TIMESTAMP}}

if [ ! -f "$WHITELIST_FILE" ]; then
    echo "[ERROR] Whitelist file not found: $WHITELIST_FILE"
    exit 1
fi

FILES=()
while IFS= read -r raw_line || [ -n "$raw_line" ]; do
    line="${raw_line%%#*}"
    line="$(echo "$line" | xargs)"
    if [ -z "$line" ]; then
        continue
    fi
    FILES+=("$line")
done < "$WHITELIST_FILE"

if [ "${#FILES[@]}" -eq 0 ]; then
    echo "[ERROR] No files configured in $WHITELIST_FILE"
    exit 1
fi

BUNDLE_STAGE="$(mktemp -d "/tmp/${BUNDLE_NAME}.XXXXXX")"
cleanup() {
    rm -rf "$BUNDLE_STAGE"
}
trap cleanup EXIT

for rel_path in "${FILES[@]}"; do
    src_path="$ROOT_DIR/$rel_path"
    if [ ! -f "$src_path" ]; then
        echo "[ERROR] Missing required file: $rel_path"
        exit 1
    fi
    mkdir -p "$BUNDLE_STAGE/$(dirname "$rel_path")"
    cp "$src_path" "$BUNDLE_STAGE/$rel_path"
done

(
    cd "$BUNDLE_STAGE"
    hash256 "${FILES[@]}" > SYNC_MANIFEST.sha256
)

mkdir -p "$OUT_DIR"
BUNDLE_PATH="$OUT_DIR/$BUNDLE_NAME.tar.gz"
tar -czf "$BUNDLE_PATH" -C "$BUNDLE_STAGE" .
hash256 "$BUNDLE_PATH" > "$BUNDLE_PATH.sha256"
cp "$BUNDLE_STAGE/SYNC_MANIFEST.sha256" "$OUT_DIR/$BUNDLE_NAME.SYNC_MANIFEST.sha256"

echo "[OK] Bundle created: $BUNDLE_PATH"
echo "[OK] Bundle sha256: $BUNDLE_PATH.sha256"
echo "[OK] Manifest copy: $OUT_DIR/$BUNDLE_NAME.SYNC_MANIFEST.sha256"
echo ""
echo "Next steps:"
echo "1) Upload bundle:"
echo "   scp -P 43821 \"$BUNDLE_PATH\" root@connect.cqa1.seetacloud.com:/root/autodl-tmp/"
echo "2) Apply on remote (script is included in the bundle):"
echo "   ssh -p 43821 root@connect.cqa1.seetacloud.com \\"
echo "     \"mkdir -p /root/autodl-tmp/training_sync_staging/$BUNDLE_NAME && \\"
echo "      tar -xzf /root/autodl-tmp/$(basename "$BUNDLE_PATH") -C /root/autodl-tmp/training_sync_staging/$BUNDLE_NAME && \\"
echo "      bash /root/autodl-tmp/training_sync_staging/$BUNDLE_NAME/scripts/apply_training_sync_bundle.sh \\"
echo "        --staging-dir /root/autodl-tmp/training_sync_staging/$BUNDLE_NAME \\"
echo "        --project-root /root/graduationDesign\""
