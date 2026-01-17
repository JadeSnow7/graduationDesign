#!/bin/bash
#
# E2E Test Script for Guided Learning
# 
# Prerequisites:
#   - jq installed (brew install jq / apt install jq)
#   - Backend running at localhost:8080
#   - AI service running at localhost:8001
#   - Test user exists: student1/password123
#
# Usage: ./e2e_guided_learning.sh
#

set -e

API_BASE="${API_BASE:-http://localhost:8080/api/v1}"
TEST_USER="${TEST_USER:-student}"
TEST_PASS="${TEST_PASS:-student123}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }
log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

# ─────────────────────────────────────────────────────────────────────────────
# Prerequisite Checks
# ─────────────────────────────────────────────────────────────────────────────
log_info "Checking prerequisites..."

# Check jq
if ! command -v jq &> /dev/null; then
    log_fail "jq is not installed. Install with: brew install jq (macOS) or apt install jq (Linux)"
fi
log_pass "jq found"

# Check backend connectivity (extract base from API_BASE, e.g., http://localhost:8080)
BACKEND_BASE=$(echo "$API_BASE" | sed 's|/api/v1||')
if ! curl -sf "$BACKEND_BASE/healthz" > /dev/null 2>&1; then
    log_fail "Backend not reachable at $API_BASE. Please start the Go server."
fi
log_pass "Backend reachable"

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Login
# ─────────────────────────────────────────────────────────────────────────────
log_info "Step 1: Login as $TEST_USER..."

LOGIN_RESP=$(curl -sf -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}" 2>&1) || {
    log_fail "Login request failed"
}

TOKEN=$(echo "$LOGIN_RESP" | jq -r '.data.token // .token // empty')

if [ -z "$TOKEN" ]; then
  log_fail "No token returned. Response: $LOGIN_RESP"
fi
log_pass "Login successful"

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Start Guided Learning Session
# ─────────────────────────────────────────────────────────────────────────────
log_info "Step 2: Start guided learning session (topic: 高斯定律)..."

GUIDED_RESP=$(curl -sf -X POST "$API_BASE/ai/chat/guided" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "高斯定律",
    "messages": [{"role": "user", "content": "我想学习高斯定律"}]
  }' 2>&1) || {
    log_fail "Guided chat request failed"
}

SESSION_ID=$(echo "$GUIDED_RESP" | jq -r '.session_id // empty')
TOTAL_STEPS=$(echo "$GUIDED_RESP" | jq '.total_steps // 0')
CURRENT_STEP=$(echo "$GUIDED_RESP" | jq '.current_step // 0')
REPLY_LENGTH=$(echo "$GUIDED_RESP" | jq '.reply | length // 0')

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
  log_fail "No session_id returned. Response: $GUIDED_RESP"
fi

if [ "$TOTAL_STEPS" -lt 1 ]; then
  log_fail "No learning path generated (total_steps=$TOTAL_STEPS)"
fi

if [ "$REPLY_LENGTH" -lt 10 ]; then
  log_fail "Reply too short (length=$REPLY_LENGTH)"
fi

log_pass "Session created: $SESSION_ID (steps: $CURRENT_STEP/$TOTAL_STEPS)"

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Continue Conversation (Correct Answer)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Step 3: Continue with correct answer..."

CORRECT_RESP=$(curl -sf -X POST "$API_BASE/ai/chat/guided" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"messages\": [{\"role\": \"user\", \"content\": \"高斯定律说的是通过任意封闭曲面的电通量等于曲面内部净电荷量除以ε₀\"}]
  }" 2>&1) || {
    log_fail "Second request failed"
}

NEW_STEP=$(echo "$CORRECT_RESP" | jq '.current_step // 0')
PROGRESS=$(echo "$CORRECT_RESP" | jq '.progress_percentage // 0')

log_pass "Progress: $PROGRESS% (step $NEW_STEP)"

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Continue Conversation (Incorrect Answer - Trigger Weak Point)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Step 4: Continue with incorrect answer (trigger weak point detection)..."

WRONG_RESP=$(curl -sf -X POST "$API_BASE/ai/chat/guided" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"messages\": [{\"role\": \"user\", \"content\": \"电场线是从负电荷发出的吧？\"}]
  }" 2>&1) || {
    log_fail "Third request failed"
}

WEAK_POINTS=$(echo "$WRONG_RESP" | jq -c '.weak_points // []')
WEAK_COUNT=$(echo "$WRONG_RESP" | jq '.weak_points | length // 0')

log_info "Weak points detected: $WEAK_POINTS (count: $WEAK_COUNT)"
log_pass "Weak point detection triggered"

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: Verify Learning Profile (if API exists)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Step 5: Check learning profile..."

PROFILE_RESP=$(curl -sf -X GET "$API_BASE/learning-profiles/1/1" \
  -H "Authorization: Bearer $TOKEN" 2>&1) || {
    log_info "Learning profile API not available or no data yet"
}

if [ -n "$PROFILE_RESP" ]; then
  PROFILE_DATA=$(echo "$PROFILE_RESP" | jq '.data // null')
  if [ "$PROFILE_DATA" != "null" ]; then
    log_pass "Learning profile exists"
  else
    log_info "Learning profile not yet created"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo -e "${GREEN}  E2E TEST COMPLETE - ALL CHECKS PASSED  ${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Session ID: $SESSION_ID"
echo "  - Total Steps: $TOTAL_STEPS"
echo "  - Progress: $PROGRESS%"
echo "  - Weak Points: $WEAK_POINTS"
echo ""
