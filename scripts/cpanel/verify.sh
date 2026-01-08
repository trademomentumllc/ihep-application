#!/bin/bash

###############################################################################
# IHEP cPanel Deployment Verification Script
#
# This script verifies that the deployment was successful and the application
# is functioning correctly on cPanel hosting
#
# Author: Jason M Jarmacz <jason@ihep.app>
# Co-Author: Claude by Anthropic <noreply@anthropic.com>
# Date: January 8, 2026
#
# Usage: ./scripts/cpanel/verify.sh [environment]
#   environment: production (default) | staging
###############################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load configuration
if [ -f "${PROJECT_ROOT}/.env.cpanel.${ENVIRONMENT}" ]; then
    source "${PROJECT_ROOT}/.env.cpanel.${ENVIRONMENT}"
elif [ -f "${PROJECT_ROOT}/.env.cpanel" ]; then
    source "${PROJECT_ROOT}/.env.cpanel"
else
    echo -e "${RED}Error: Configuration file not found${NC}"
    exit 1
fi

# Set URL based on environment
if [ "${ENVIRONMENT}" == "production" ]; then
    APP_URL="https://ihep.app"
else
    APP_URL="https://staging.ihep.app"
fi

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

###############################################################################
# Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((CHECKS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
    ((CHECKS_WARNING++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((CHECKS_FAILED++))
}

check_http_status() {
    local url="$1"
    local expected="${2:-200}"
    local description="$3"

    log_info "Checking: ${description}"

    local status_code=$(curl -s -o /dev/null -w "%{http_code}" -L "${url}" || echo "000")

    if [ "${status_code}" == "${expected}" ]; then
        log_success "${description} - Status: ${status_code}"
    else
        log_error "${description} - Expected ${expected}, got ${status_code}"
    fi
}

check_ssh_connection() {
    log_info "Checking SSH connection..."

    if ssh -i "${CPANEL_SSH_KEY_PATH}" -o ConnectTimeout=5 -o BatchMode=yes \
        "${CPANEL_USERNAME}@${CPANEL_HOST}" "echo 'SSH OK'" &> /dev/null; then
        log_success "SSH connection successful"
    else
        log_error "Cannot connect via SSH"
    fi
}

check_deployment_files() {
    log_info "Checking deployment files on server..."

    local required_files=(
        "package.json"
        ".next"
        "public"
        "deployment-info.json"
    )

    local missing_files=()

    for file in "${required_files[@]}"; do
        if ! ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
            "test -e ${DEPLOY_PATH}/${file}" 2>/dev/null; then
            missing_files+=("${file}")
        fi
    done

    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "All required files present on server"
    else
        log_error "Missing files: ${missing_files[*]}"
    fi
}

check_node_modules() {
    log_info "Checking node_modules installation..."

    if ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "test -d ${DEPLOY_PATH}/node_modules" 2>/dev/null; then
        log_success "node_modules directory exists"
    else
        log_warning "node_modules directory not found (may be using standalone build)"
    fi
}

check_process_running() {
    log_info "Checking if Node.js process is running..."

    # Check PM2
    if ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "command -v pm2 &> /dev/null && pm2 list | grep -q ihep-app" 2>/dev/null; then
        log_success "Node.js application running via PM2"
        return
    fi

    # Check for node process
    if ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "pgrep -f 'node.*ihep' > /dev/null" 2>/dev/null; then
        log_success "Node.js process is running"
    else
        log_error "No Node.js process found"
    fi
}

check_port_listening() {
    log_info "Checking if application is listening on port ${APP_PORT}..."

    if ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "netstat -tuln | grep -q ':${APP_PORT}'" 2>/dev/null; then
        log_success "Application listening on port ${APP_PORT}"
    else
        log_error "Application not listening on port ${APP_PORT}"
    fi
}

check_ssl_certificate() {
    log_info "Checking SSL certificate..."

    local ssl_info=$(echo | openssl s_client -servername "${APP_URL#https://}" \
        -connect "${APP_URL#https://}:443" 2>/dev/null | \
        openssl x509 -noout -dates 2>/dev/null)

    if [ $? -eq 0 ]; then
        log_success "SSL certificate is valid"
        echo "${ssl_info}" | sed 's/^/    /'
    else
        log_warning "Could not verify SSL certificate"
    fi
}

check_security_headers() {
    log_info "Checking security headers..."

    local headers=$(curl -s -I -L "${APP_URL}" 2>/dev/null)

    local required_headers=(
        "X-Content-Type-Options"
        "X-Frame-Options"
        "Strict-Transport-Security"
    )

    for header in "${required_headers[@]}"; do
        if echo "${headers}" | grep -qi "${header}"; then
            log_success "Security header present: ${header}"
        else
            log_warning "Security header missing: ${header}"
        fi
    done
}

check_static_assets() {
    log_info "Checking static asset loading..."

    # Check for common static files
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/favicon.ico" 2>/dev/null || echo "000")

    if [ "${status_code}" == "200" ]; then
        log_success "Static assets are accessible"
    else
        log_warning "Static asset test failed (favicon.ico returned ${status_code})"
    fi
}

check_page_load_time() {
    log_info "Checking page load time..."

    local load_time=$(curl -s -o /dev/null -w "%{time_total}" "${APP_URL}" 2>/dev/null || echo "999")

    if (( $(echo "${load_time} < 3.0" | bc -l) )); then
        log_success "Page load time: ${load_time}s (< 3s)"
    elif (( $(echo "${load_time} < 5.0" | bc -l) )); then
        log_warning "Page load time: ${load_time}s (3-5s - consider optimization)"
    else
        log_error "Page load time: ${load_time}s (> 5s - performance issue)"
    fi
}

check_deployment_info() {
    log_info "Retrieving deployment information..."

    local deploy_info=$(ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "cat ${DEPLOY_PATH}/deployment-info.json 2>/dev/null" || echo "{}")

    if [ "${deploy_info}" != "{}" ]; then
        log_success "Deployment info retrieved"
        echo "${deploy_info}" | python3 -m json.tool 2>/dev/null || echo "${deploy_info}"
    else
        log_warning "No deployment info found"
    fi
}

check_error_logs() {
    log_info "Checking for recent errors in logs..."

    local errors=$(ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "tail -100 ${DEPLOY_PATH}/logs/*.log 2>/dev/null | grep -i error | tail -5" || echo "")

    if [ -z "${errors}" ]; then
        log_success "No recent errors in logs"
    else
        log_warning "Recent errors found in logs:"
        echo "${errors}" | sed 's/^/    /'
    fi
}

check_disk_space() {
    log_info "Checking disk space..."

    local disk_usage=$(ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "df -h ${DEPLOY_PATH} | tail -1 | awk '{print \$5}'" 2>/dev/null || echo "Unknown")

    local usage_percent=$(echo "${disk_usage}" | tr -d '%')

    if [ "${usage_percent}" -lt 80 ] 2>/dev/null; then
        log_success "Disk space usage: ${disk_usage}"
    elif [ "${usage_percent}" -lt 90 ] 2>/dev/null; then
        log_warning "Disk space usage: ${disk_usage} (consider cleanup)"
    else
        log_error "Disk space usage: ${disk_usage} (critically high)"
    fi
}

###############################################################################
# Main execution
###############################################################################

main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}IHEP Deployment Verification${NC}"
    echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${GREEN}URL: ${APP_URL}${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""

    # Infrastructure checks
    echo -e "${BLUE}--- Infrastructure Checks ---${NC}"
    check_ssh_connection
    check_deployment_files
    check_node_modules
    check_disk_space
    echo ""

    # Application checks
    echo -e "${BLUE}--- Application Checks ---${NC}"
    check_process_running
    check_port_listening
    echo ""

    # HTTP/HTTPS checks
    echo -e "${BLUE}--- HTTP/HTTPS Checks ---${NC}"
    check_http_status "${APP_URL}" "200" "Homepage"
    check_http_status "${APP_URL}/api/health" "200" "Health endpoint"
    check_ssl_certificate
    check_security_headers
    check_static_assets
    check_page_load_time
    echo ""

    # Deployment info
    echo -e "${BLUE}--- Deployment Information ---${NC}"
    check_deployment_info
    echo ""

    # Logs and monitoring
    echo -e "${BLUE}--- Logs and Monitoring ---${NC}"
    check_error_logs
    echo ""

    # Summary
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Verification Summary${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Passed:${NC}  ${CHECKS_PASSED}"
    echo -e "${YELLOW}Warnings:${NC} ${CHECKS_WARNING}"
    echo -e "${RED}Failed:${NC}  ${CHECKS_FAILED}"
    echo ""

    if [ ${CHECKS_FAILED} -eq 0 ]; then
        echo -e "${GREEN}✓ Deployment verification PASSED${NC}"
        exit 0
    else
        echo -e "${RED}✗ Deployment verification FAILED${NC}"
        echo -e "${YELLOW}Please review failed checks above${NC}"
        exit 1
    fi
}

main
