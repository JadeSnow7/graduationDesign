#!/usr/bin/env bash
set -euo pipefail

# E2E-style API test for edge local-first flow.
# This validates the same backend endpoint used by Expo Web:
#   POST /api/v1/ai/chat
#
# Prereq:
# - swift deploy: 127.0.0.1:18080
# - ai_service:   127.0.0.1:8001
# - backend:      127.0.0.1:8080

API_BASE="${API_BASE:-http://127.0.0.1:8080/api/v1}"
REPORT_DIR="/Users/huaodong/graduationDesign/outputs/edge_poc/reports"
DATE_TAG="$(date +%Y%m%d)"
REPORT_FILE="$REPORT_DIR/client_web_e2e_edge_v1_${DATE_TAG}.md"
TMP_RESP_FILE="$(mktemp)"
TMP_CASES_FILE="$(mktemp)"

cleanup() {
  rm -f "$TMP_RESP_FILE" "$TMP_CASES_FILE"
}
trap cleanup EXIT

mkdir -p "$REPORT_DIR"

if ! command -v jq >/dev/null 2>&1; then
  echo "[ERROR] jq is required for this test script" >&2
  exit 1
fi

cat >"$TMP_CASES_FILE" <<'EOF'
课程资源1|course_resource|有没有关于安培定律的学习资料？
课程资源2|course_resource|请给我法拉第电磁感应定律相关课件和练习题
课程资源3|course_resource|电场边界条件有哪些可用学习资源？
课程资源4|course_resource|推荐一些高斯定理复习材料
学习追踪1|learning_tracking|我今天学习了什么内容？
学习追踪2|learning_tracking|帮我总结本周学习进度并指出薄弱点
学习追踪3|learning_tracking|根据最近学习记录给我一个明天的复习建议
简单问答1|simple_qa|电场强度的定义是什么？
简单问答2|simple_qa|安培环路定律的积分形式是什么？
简单问答3|simple_qa|什么是位移电流？
复杂推理1|complex_reasoning|请证明格林定理
复杂推理2|complex_reasoning|请推导波动方程并给出严格证明
EOF

{
  echo "# Client Web E2E Edge V1 (${DATE_TAG})"
  echo
  echo "- Test mode: backend API compatibility test for Expo Web path"
  echo "- API_BASE: ${API_BASE}"
  echo "- Time(UTC): $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo
} >"$REPORT_FILE"

echo "[INFO] Checking health endpoints..."
curl -sf "http://127.0.0.1:18080/health" >/dev/null
curl -sf "http://127.0.0.1:8001/healthz" >/dev/null
curl -sf "http://127.0.0.1:8080/healthz" >/dev/null

echo "[INFO] Logging in as student..."
LOGIN_RESP="$(curl -sf -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"student123"}')"
TOKEN="$(echo "$LOGIN_RESP" | jq -r '.data.access_token // .access_token // empty')"
if [ -z "$TOKEN" ]; then
  echo "[ERROR] login failed, response=$LOGIN_RESP" >&2
  exit 1
fi

total=0
ok_non_empty=0
complex_total=0
complex_hint_ok=0

echo "## Results" >>"$REPORT_FILE"
echo >>"$REPORT_FILE"

while IFS='|' read -r case_name case_type prompt; do
  [ -z "$case_name" ] && continue
  total=$((total + 1))
  if [ "$case_type" = "complex_reasoning" ]; then
    complex_total=$((complex_total + 1))
  fi

  body="$(jq -n \
    --arg mode "tutor" \
    --arg content "$prompt" \
    '{mode:$mode,messages:[{role:"user",content:$content}],stream:false}')"

  http_code="$(curl -sS -o "$TMP_RESP_FILE" -w "%{http_code}" -X POST "$API_BASE/ai/chat" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$body")"

  reply="$(jq -r '.data.reply // .reply // ""' "$TMP_RESP_FILE" 2>/dev/null || true)"
  model="$(jq -r '.data.model // .model // ""' "$TMP_RESP_FILE" 2>/dev/null || true)"

  non_empty="no"
  if [ -n "${reply// }" ]; then
    non_empty="yes"
    ok_non_empty=$((ok_non_empty + 1))
  fi

  complex_hint="n/a"
  if [ "$case_type" = "complex_reasoning" ]; then
    complex_hint="no"
    if echo "$reply" | rg -q "云端|转发|复杂|证明"; then
      complex_hint="yes"
      complex_hint_ok=$((complex_hint_ok + 1))
    fi
  fi

  {
    echo "### ${case_name}"
    echo "- type: ${case_type}"
    echo "- prompt: ${prompt}"
    echo "- http_code: ${http_code}"
    echo "- model: ${model:-N/A}"
    echo "- non_empty_reply: ${non_empty}"
    echo "- complex_hint: ${complex_hint}"
    echo "- reply: ${reply}"
    echo
  } >>"$REPORT_FILE"
done <"$TMP_CASES_FILE"

success_rate=0
if [ "$total" -gt 0 ]; then
  success_rate=$((ok_non_empty * 100 / total))
fi

{
  echo "## Summary"
  echo "- total_cases: ${total}"
  echo "- non_empty_replies: ${ok_non_empty}"
  echo "- non_empty_success_rate: ${success_rate}%"
  echo "- complex_cases: ${complex_total}"
  echo "- complex_hint_ok: ${complex_hint_ok}"
  echo
  echo "## Acceptance Check"
  if [ "$success_rate" -ge 90 ]; then
    echo "- Expo Web path non-empty success rate >= 90%: PASS"
  else
    echo "- Expo Web path non-empty success rate >= 90%: FAIL"
  fi
  if [ "$complex_hint_ok" -ge 1 ]; then
    echo "- Complex reasoning returns cloud-forward semantics: PASS"
  else
    echo "- Complex reasoning returns cloud-forward semantics: FAIL"
  fi
} >>"$REPORT_FILE"

echo "[INFO] Report generated: $REPORT_FILE"
echo "$REPORT_FILE"
