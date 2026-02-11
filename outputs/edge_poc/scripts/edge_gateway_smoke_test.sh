#!/usr/bin/env bash
set -euo pipefail

# Smoke test: backend -> ai_service -> swift deploy.
#
# Prereq:
# - swift deploy on 127.0.0.1:18080
# - ai_service on 127.0.0.1:8001
# - backend on 127.0.0.1:8080

API_BASE="${API_BASE:-http://127.0.0.1:8080/api/v1}"
REPORT_DIR="/Users/huaodong/graduationDesign/outputs/edge_poc/reports"
DATE_TAG="$(date +%Y%m%d)"
REPORT_FILE="$REPORT_DIR/edge_gateway_smoke_${DATE_TAG}.md"

mkdir -p "$REPORT_DIR"

if ! command -v jq >/dev/null 2>&1; then
  echo "[ERROR] jq is required for this smoke test" >&2
  exit 1
fi

echo "# Edge Gateway Smoke Test ($DATE_TAG)" >"$REPORT_FILE"
echo "" >>"$REPORT_FILE"
echo "- API_BASE: $API_BASE" >>"$REPORT_FILE"
echo "- Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >>"$REPORT_FILE"
echo "" >>"$REPORT_FILE"

echo "[INFO] Checking service health..."
curl -sf "http://127.0.0.1:18080/health" >/dev/null
curl -sf "http://127.0.0.1:8001/healthz" >/dev/null
curl -sf "http://127.0.0.1:8080/healthz" >/dev/null

echo "## Health" >>"$REPORT_FILE"
echo "- swift deploy: ok" >>"$REPORT_FILE"
echo "- ai_service: ok" >>"$REPORT_FILE"
echo "- backend: ok" >>"$REPORT_FILE"
echo "" >>"$REPORT_FILE"

echo "[INFO] Logging in with student account..."
LOGIN_RESP="$(curl -sf -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"student123"}')"
TOKEN="$(echo "$LOGIN_RESP" | jq -r '.data.access_token // .access_token // .data.token // .token // empty')"
if [ -z "$TOKEN" ]; then
  echo "[ERROR] login failed, response=$LOGIN_RESP" >&2
  exit 1
fi

run_case() {
  local name="$1"
  local content="$2"
  local body
  body="$(jq -n \
    --arg mode "tutor" \
    --arg content "$content" \
    '{mode:$mode,messages:[{role:"user",content:$content}],stream:false}')"

  local resp
  resp="$(curl -sf -X POST "$API_BASE/ai/chat" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$body")"
  local reply
  reply="$(echo "$resp" | jq -r '.data.reply // .reply // ""')"
  local model
  model="$(echo "$resp" | jq -r '.data.model // .model // ""')"

  {
    echo "### $name"
    echo "- query: $content"
    echo "- model: ${model:-N/A}"
    echo "- reply_length: ${#reply}"
    echo "- reply: ${reply}"
    echo ""
  } >>"$REPORT_FILE"
}

echo "## Cases" >>"$REPORT_FILE"
run_case "课程资源" "有没有关于安培定律的学习资料？"
run_case "学习追踪" "我今天学习了什么内容？"
run_case "简单问答" "电场强度的定义是什么？"
run_case "复杂推理提示" "请证明格林定理"

echo "[INFO] Smoke test report generated: $REPORT_FILE"
echo "$REPORT_FILE"
