#!/usr/bin/env bash
#
# 全流程测试脚本 - 基于标准化测试指南
#
# 功能：自动化执行 7 步测试流程，生成测试报告并判定门槛
#
# 用法：
#   ./scripts/test_pipeline.sh           # 完整测试
#   ./scripts/test_pipeline.sh --quick   # 快速测试（跳过性能评测）
#   ./scripts/test_pipeline.sh --skip-e2e # 跳过 E2E 测试
#   ./scripts/test_pipeline.sh --help    # 查看帮助
#

set -o pipefail

# ─────────────────────────────────────────────────────────────────────────────
# 配置
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CODE_DIR="$PROJECT_ROOT/code"
TESTS_DIR="$PROJECT_ROOT/tests"
REPORT_DIR="$PROJECT_ROOT/test_reports"
REPORT_FILE="$REPORT_DIR/test_report_$(date +%Y%m%d_%H%M%S).json"

# 门槛阈值
COVERAGE_THRESHOLD=60
PASS_RATE_THRESHOLD=95

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 默认选项
SKIP_REPO=false
SKIP_UNIT=false
SKIP_E2E=false
SKIP_PERF=false
QUICK_MODE=false
VERBOSE=false

# 测试结果跟踪（使用普通变量，兼容 bash 3.x）
STEP1_RESULT="unknown"
STEP2_RESULT="unknown"
STEP3_RESULT="unknown"
STEP4_RESULT="unknown"
STEP5_RESULT="unknown"
STEP6_RESULT="unknown"
STEP7_RESULT="unknown"

# 详情
BACKEND_COVERAGE="N/A"
AI_COVERAGE="N/A"
AVG_RESPONSE_MS="N/A"

TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_SKIPPED=0

# ─────────────────────────────────────────────────────────────────────────────
# 工具函数
# ─────────────────────────────────────────────────────────────────────────────
log_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
}

log_step() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

log_pass() {
    echo -e "${GREEN}✓ $1${NC}"
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
}

log_fail() {
    echo -e "${RED}✗ $1${NC}"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
}

log_skip() {
    echo -e "${YELLOW}⊘ $1 (跳过)${NC}"
    TOTAL_SKIPPED=$((TOTAL_SKIPPED + 1))
}

log_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-repo)
                SKIP_REPO=true
                shift
                ;;
            --skip-unit)
                SKIP_UNIT=true
                shift
                ;;
            --skip-e2e)
                SKIP_E2E=true
                shift
                ;;
            --skip-perf)
                SKIP_PERF=true
                shift
                ;;
            --quick)
                QUICK_MODE=true
                SKIP_PERF=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

show_help() {
    cat << EOF
全流程测试脚本 - 基于标准化测试指南

用法: $0 [选项]

选项:
  --quick       快速模式，跳过性能评测
  --skip-repo   跳过仓库一致性测试
  --skip-unit   跳过单元测试
  --skip-e2e    跳过端到端测试
  --skip-perf   跳过性能评测
  --verbose, -v 详细输出
  --help, -h    显示帮助

示例:
  $0                    # 完整测试
  $0 --quick            # 快速测试
  $0 --skip-repo        # 跳过仓库测试
  $0 --skip-e2e         # 跳过 E2E
  $0 --verbose          # 详细模式

测试步骤:
  1. 范围确认与测试矩阵
  2. 仓库一致性测试
  3. 服务级单元测试与覆盖率
  4. 集成测试
  5. 端到端测试
  6. 性能与质量评测
  7. 门槛判定与报告
EOF
}

# ─────────────────────────────────────────────────────────────────────────────
# 步骤 1：范围确认与测试矩阵
# ─────────────────────────────────────────────────────────────────────────────
step1_scope() {
    log_header "步骤 1：范围确认与测试矩阵"
    
    log_step "检测变更范围..."
    
    # 检测是否在 git 仓库中
    if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree &>/dev/null; then
        log_warn "非 Git 仓库，跳过范围检测"
        STEP1_RESULT="skip"
        return 0
    fi
    
    # 获取变更文件
    local changed_files
    if git -C "$PROJECT_ROOT" rev-parse --verify main &>/dev/null; then
        changed_files=$(git -C "$PROJECT_ROOT" diff --name-only main...HEAD 2>/dev/null || echo "")
    else
        changed_files=$(git -C "$PROJECT_ROOT" diff --name-only HEAD~1 2>/dev/null || echo "")
    fi
    
    # 统计变更
    local backend_changes=0
    local ai_changes=0
    local sim_changes=0
    local frontend_changes=0
    local docs_changes=0
    
    while IFS= read -r file; do
        case "$file" in
            code/backend/*) backend_changes=$((backend_changes + 1)) ;;
            code/ai_service/*) ai_changes=$((ai_changes + 1)) ;;
            code/simulation/*) sim_changes=$((sim_changes + 1)) ;;
            code/frontend*) frontend_changes=$((frontend_changes + 1)) ;;
            docs/*) docs_changes=$((docs_changes + 1)) ;;
        esac
    done <<< "$changed_files"
    
    log_info "变更统计:"
    echo "  - Backend:    $backend_changes 文件"
    echo "  - AI Service: $ai_changes 文件"
    echo "  - Simulation: $sim_changes 文件"
    echo "  - Frontend:   $frontend_changes 文件"
    echo "  - Docs:       $docs_changes 文件"
    
    STEP1_RESULT="pass"
    log_pass "范围确认完成"
}

# ─────────────────────────────────────────────────────────────────────────────
# 步骤 2：仓库一致性测试
# ─────────────────────────────────────────────────────────────────────────────
step2_repo_validation() {
    log_header "步骤 2：仓库一致性测试"
    
    if $SKIP_REPO; then
        log_skip "仓库一致性测试"
        STEP2_RESULT="skip"
        return 0
    fi
    
    if [[ ! -d "$TESTS_DIR" ]]; then
        log_warn "测试目录不存在: $TESTS_DIR"
        STEP2_RESULT="skip"
        return 0
    fi
    
    log_step "运行仓库校验测试..."
    
    cd "$TESTS_DIR" || { log_fail "无法进入测试目录"; return 1; }
    
    # 检查依赖
    if [[ ! -d "node_modules" ]]; then
        log_info "安装测试依赖..."
        npm install --silent || { log_fail "依赖安装失败"; return 1; }
    fi
    
    # 运行测试
    local test_output
    if test_output=$(npm test 2>&1); then
        log_pass "仓库一致性测试通过"
        STEP2_RESULT="pass"
    else
        log_fail "仓库一致性测试失败"
        if $VERBOSE; then
            echo "$test_output"
        fi
        STEP2_RESULT="fail"
        cd "$PROJECT_ROOT" || exit 1
        return 1
    fi
    
    cd "$PROJECT_ROOT" || exit 1
}

# ─────────────────────────────────────────────────────────────────────────────
# 步骤 3：服务级单元测试与覆盖率
# ─────────────────────────────────────────────────────────────────────────────
step3_unit_tests() {
    log_header "步骤 3：服务级单元测试与覆盖率"
    
    if $SKIP_UNIT; then
        log_skip "单元测试"
        STEP3_RESULT="skip"
        return 0
    fi
    
    local backend_ok=true
    local ai_ok=true
    local frontend_ok=true
    
    # 3.1 Go Backend
    log_step "3.1 Go Backend 测试"
    if [[ -d "$CODE_DIR/backend" ]]; then
        cd "$CODE_DIR/backend" || exit 1
        
        if go test -v ./... -coverprofile=coverage.out 2>&1 | tee /tmp/go_test.log; then
            # 提取覆盖率
            local coverage
            coverage=$(go tool cover -func=coverage.out 2>/dev/null | tail -1 | grep -o '[0-9.]*%' | tr -d '%' || echo "0")
            log_pass "Backend 测试通过 (覆盖率: ${coverage}%)"
            BACKEND_COVERAGE="$coverage"
        else
            log_fail "Backend 测试失败"
            backend_ok=false
        fi
        cd "$PROJECT_ROOT" || exit 1
    else
        log_warn "Backend 目录不存在"
    fi
    
    # 3.2 AI Service
    log_step "3.2 AI Service 测试"
    if [[ -d "$CODE_DIR/ai_service" ]]; then
        cd "$CODE_DIR/ai_service" || exit 1
        
        # 检查 pytest 是否可用
        if command -v pytest &>/dev/null; then
            if pytest -v --cov=app --cov-report=term-missing 2>&1 | tee /tmp/pytest_ai.log; then
                # 提取覆盖率
                local ai_cov
                ai_cov=$(grep -o 'TOTAL.*[0-9]*%' /tmp/pytest_ai.log | grep -o '[0-9]*%' | tr -d '%' || echo "0")
                log_pass "AI Service 测试通过 (覆盖率: ${ai_cov}%)"
                AI_COVERAGE="$ai_cov"
            else
                log_fail "AI Service 测试失败"
                ai_ok=false
            fi
        else
            log_warn "pytest 未安装，跳过 AI Service 测试"
        fi
        cd "$PROJECT_ROOT" || exit 1
    else
        log_warn "AI Service 目录不存在"
    fi
    
    # 3.3 Simulation Service
    log_step "3.3 Simulation Service 测试"
    if [[ -d "$CODE_DIR/simulation" ]]; then
        cd "$CODE_DIR/simulation" || exit 1
        
        if [[ -d "tests" ]] && command -v pytest &>/dev/null; then
            if pytest -v --cov=app 2>&1; then
                log_pass "Simulation 测试通过"
            else
                log_fail "Simulation 测试失败"
            fi
        else
            log_skip "Simulation 测试 (无测试目录或 pytest)"
        fi
        cd "$PROJECT_ROOT" || exit 1
    fi
    
    # 3.4 Frontend 构建校验
    log_step "3.4 Frontend 构建校验"
    
    # Vue Frontend
    if [[ -d "$CODE_DIR/frontend" ]]; then
        cd "$CODE_DIR/frontend" || exit 1
        if [[ ! -d "node_modules" ]]; then
            npm install --silent 2>/dev/null
        fi
        if npm run build 2>&1 | tail -5; then
            log_pass "Vue Frontend 构建成功"
        else
            log_fail "Vue Frontend 构建失败"
            frontend_ok=false
        fi
        cd "$PROJECT_ROOT" || exit 1
    fi
    
    # React Frontend
    if [[ -d "$CODE_DIR/frontend-react" ]]; then
        cd "$CODE_DIR/frontend-react" || exit 1
        if [[ ! -d "node_modules" ]]; then
            npm install --silent 2>/dev/null
        fi
        if npm run build 2>&1 | tail -5; then
            log_pass "React Frontend 构建成功"
        else
            log_fail "React Frontend 构建失败"
            frontend_ok=false
        fi
        cd "$PROJECT_ROOT" || exit 1
    fi
    
    # 汇总结果
    if $backend_ok && $ai_ok && $frontend_ok; then
        STEP3_RESULT="pass"
    else
        STEP3_RESULT="fail"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 步骤 4：集成测试
# ─────────────────────────────────────────────────────────────────────────────
step4_integration() {
    log_header "步骤 4：集成测试"
    
    log_step "检查服务健康状态..."
    
    local backend_health=false
    local ai_health=false
    
    # 检查 Backend
    if curl -sf http://localhost:8080/healthz &>/dev/null; then
        log_pass "Backend 健康检查通过 (localhost:8080)"
        backend_health=true
    else
        log_warn "Backend 未运行或不可达"
    fi
    
    # 检查 AI Service
    if curl -sf http://localhost:8001/healthz &>/dev/null; then
        log_pass "AI Service 健康检查通过 (localhost:8001)"
        ai_health=true
    else
        log_warn "AI Service 未运行或不可达"
    fi
    
    if $backend_health && $ai_health; then
        log_step "执行集成测试..."
        
        # 测试认证接口
        log_info "测试认证接口..."
        local login_resp
        login_resp=$(curl -sf -X POST "http://localhost:8080/api/v1/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"username":"admin","password":"admin123"}' 2>&1)
        
        if echo "$login_resp" | grep -q "token"; then
            log_pass "认证接口正常"
        else
            log_warn "认证接口响应异常"
        fi
        
        STEP4_RESULT="pass"
    else
        log_skip "集成测试 (服务未就绪)"
        STEP4_RESULT="skip"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 步骤 5：端到端测试
# ─────────────────────────────────────────────────────────────────────────────
step5_e2e() {
    log_header "步骤 5：端到端测试"
    
    if $SKIP_E2E; then
        log_skip "E2E 测试"
        STEP5_RESULT="skip"
        return 0
    fi
    
    local e2e_script="$SCRIPT_DIR/e2e_guided_learning.sh"
    
    if [[ ! -f "$e2e_script" ]]; then
        log_warn "E2E 脚本不存在: $e2e_script"
        STEP5_RESULT="skip"
        return 0
    fi
    
    # 检查前置条件
    if ! command -v jq &>/dev/null; then
        log_warn "jq 未安装，跳过 E2E 测试"
        STEP5_RESULT="skip"
        return 0
    fi
    
    # 检查服务
    if ! curl -sf http://localhost:8080/healthz &>/dev/null; then
        log_warn "Backend 未运行，跳过 E2E 测试"
        STEP5_RESULT="skip"
        return 0
    fi
    
    log_step "运行引导式学习 E2E 测试..."
    
    if bash "$e2e_script" 2>&1; then
        log_pass "E2E 测试通过"
        STEP5_RESULT="pass"
    else
        log_fail "E2E 测试失败"
        STEP5_RESULT="fail"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 步骤 6：性能与质量评测
# ─────────────────────────────────────────────────────────────────────────────
step6_performance() {
    log_header "步骤 6：性能与质量评测"
    
    if $SKIP_PERF; then
        log_skip "性能评测"
        STEP6_RESULT="skip"
        return 0
    fi
    
    # 检查服务是否运行
    if ! curl -sf http://localhost:8080/healthz &>/dev/null; then
        log_warn "服务未运行，跳过性能测试"
        STEP6_RESULT="skip"
        return 0
    fi
    
    log_step "执行基础性能测试..."
    
    # 简单的响应时间测试
    local total_time=0
    local count=0
    
    for endpoint in "/api/v1/courses" "/healthz"; do
        local response_time
        response_time=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:8080$endpoint" 2>/dev/null || echo "0")
        
        # 使用 awk 代替 bc（更好的兼容性）
        local response_time_ms
        response_time_ms=$(awk "BEGIN {printf \"%.2f\", $response_time * 1000}" 2>/dev/null || echo "0")
        
        log_info "$endpoint: ${response_time_ms}ms"
        total_time=$(awk "BEGIN {printf \"%.2f\", $total_time + $response_time_ms}" 2>/dev/null || echo "0")
        count=$((count + 1))
    done
    
    if [[ $count -gt 0 ]]; then
        local avg_time
        avg_time=$(awk "BEGIN {printf \"%.2f\", $total_time / $count}" 2>/dev/null || echo "0")
        log_info "平均响应时间: ${avg_time}ms"
        AVG_RESPONSE_MS="$avg_time"
        
        # 判断是否达标 (300ms)
        local threshold_check
        threshold_check=$(awk "BEGIN {print ($avg_time < 300) ? 1 : 0}" 2>/dev/null || echo "0")
        
        if [[ "$threshold_check" == "1" ]]; then
            log_pass "性能达标 (< 300ms)"
            STEP6_RESULT="pass"
        else
            log_warn "性能未达标 (> 300ms)"
            STEP6_RESULT="warn"
        fi
    else
        STEP6_RESULT="skip"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 步骤 7：门槛判定与报告
# ─────────────────────────────────────────────────────────────────────────────
step7_report() {
    log_header "步骤 7：门槛判定与报告"
    
    # 创建报告目录
    mkdir -p "$REPORT_DIR"
    
    # 计算通过率
    local total=$((TOTAL_PASSED + TOTAL_FAILED))
    local pass_rate=0
    if [[ $total -gt 0 ]]; then
        pass_rate=$(awk "BEGIN {printf \"%.2f\", $TOTAL_PASSED * 100 / $total}" 2>/dev/null || echo "0")
    fi
    
    # 生成 JSON 报告
    cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S)",
  "summary": {
    "passed": $TOTAL_PASSED,
    "failed": $TOTAL_FAILED,
    "skipped": $TOTAL_SKIPPED,
    "pass_rate": "${pass_rate}%"
  },
  "steps": {
    "step1_scope": "$STEP1_RESULT",
    "step2_repo": "$STEP2_RESULT",
    "step3_unit": "$STEP3_RESULT",
    "step4_integration": "$STEP4_RESULT",
    "step5_e2e": "$STEP5_RESULT",
    "step6_performance": "$STEP6_RESULT"
  },
  "details": {
    "backend_coverage": "${BACKEND_COVERAGE}%",
    "ai_coverage": "${AI_COVERAGE}%",
    "avg_response_ms": "$AVG_RESPONSE_MS"
  },
  "thresholds": {
    "coverage": "${COVERAGE_THRESHOLD}%",
    "pass_rate": "${PASS_RATE_THRESHOLD}%"
  }
}
EOF
    
    log_info "测试报告已生成: $REPORT_FILE"
    
    # 打印汇总
    echo ""
    echo -e "${BOLD}════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}                        测 试 汇 总                                 ${NC}"
    echo -e "${BOLD}════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  通过: ${GREEN}$TOTAL_PASSED${NC}"
    echo -e "  失败: ${RED}$TOTAL_FAILED${NC}"
    echo -e "  跳过: ${YELLOW}$TOTAL_SKIPPED${NC}"
    echo -e "  通过率: ${CYAN}${pass_rate}%${NC}"
    echo ""
    
    # 步骤状态
    echo "  步骤状态:"
    print_step_status "step1" "$STEP1_RESULT"
    print_step_status "step2" "$STEP2_RESULT"
    print_step_status "step3" "$STEP3_RESULT"
    print_step_status "step4" "$STEP4_RESULT"
    print_step_status "step5" "$STEP5_RESULT"
    print_step_status "step6" "$STEP6_RESULT"
    echo ""
    
    # 门槛判定
    echo -e "${BOLD}  门槛判定:${NC}"
    
    local all_pass=true
    
    # 覆盖率判定
    local cov_check
    cov_check=$(awk "BEGIN {print (\"$BACKEND_COVERAGE\" != \"N/A\" && $BACKEND_COVERAGE >= $COVERAGE_THRESHOLD) ? 1 : 0}" 2>/dev/null || echo "0")
    
    if [[ "$cov_check" == "1" ]]; then
        echo -e "    ${GREEN}✓${NC} 覆盖率 ${BACKEND_COVERAGE}% >= ${COVERAGE_THRESHOLD}%"
    else
        echo -e "    ${RED}✗${NC} 覆盖率 ${BACKEND_COVERAGE}% < ${COVERAGE_THRESHOLD}%"
        all_pass=false
    fi
    
    # 通过率判定
    local rate_check
    rate_check=$(awk "BEGIN {print ($pass_rate >= $PASS_RATE_THRESHOLD) ? 1 : 0}" 2>/dev/null || echo "0")
    
    if [[ "$rate_check" == "1" ]]; then
        echo -e "    ${GREEN}✓${NC} 通过率 ${pass_rate}% >= ${PASS_RATE_THRESHOLD}%"
    else
        echo -e "    ${RED}✗${NC} 通过率 ${pass_rate}% < ${PASS_RATE_THRESHOLD}%"
        all_pass=false
    fi
    
    echo ""
    echo -e "${BOLD}════════════════════════════════════════════════════════════════════${NC}"
    
    if $all_pass && [[ $TOTAL_FAILED -eq 0 ]]; then
        echo -e "${GREEN}${BOLD}                      ✓ 测试通过，可以发布                        ${NC}"
        STEP7_RESULT="pass"
        return 0
    else
        echo -e "${RED}${BOLD}                      ✗ 测试未通过，请修复问题                      ${NC}"
        STEP7_RESULT="fail"
        return 1
    fi
}

print_step_status() {
    local step="$1"
    local status="$2"
    local icon
    case "$status" in
        pass) icon="${GREEN}✓${NC}" ;;
        fail) icon="${RED}✗${NC}" ;;
        skip) icon="${YELLOW}⊘${NC}" ;;
        warn) icon="${YELLOW}⚠${NC}" ;;
        *) icon="${CYAN}?${NC}" ;;
    esac
    echo -e "    $icon $step: $status"
}

# ─────────────────────────────────────────────────────────────────────────────
# 主函数
# ─────────────────────────────────────────────────────────────────────────────
main() {
    parse_args "$@"
    
    echo ""
    echo -e "${BOLD}${BLUE}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║                                                                   ║${NC}"
    echo -e "${BOLD}${BLUE}║           全 流 程 测 试 脚 本                                    ║${NC}"
    echo -e "${BOLD}${BLUE}║           基于标准化测试指南                                       ║${NC}"
    echo -e "${BOLD}${BLUE}║                                                                   ║${NC}"
    echo -e "${BOLD}${BLUE}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_info "项目根目录: $PROJECT_ROOT"
    log_info "测试开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
    
    if $QUICK_MODE; then
        log_info "模式: 快速测试"
    fi
    
    # 执行测试步骤
    step1_scope
    step2_repo_validation
    step3_unit_tests
    step4_integration
    step5_e2e
    step6_performance
    step7_report
    
    exit_code=$?
    
    log_info "测试结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
    
    exit $exit_code
}

main "$@"
