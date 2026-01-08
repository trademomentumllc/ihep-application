#!/bin/bash

###############################################################################
# IHEP cPanel Rollback Script
#
# This script rolls back to a previous deployment on cPanel hosting
#
# Author: Jason M Jarmacz <jason@ihep.app>
# Co-Author: Claude by Anthropic <noreply@anthropic.com>
# Date: January 8, 2026
#
# Usage: ./scripts/cpanel/rollback.sh [backup_timestamp]
#   If no timestamp is provided, rolls back to the most recent backup
###############################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load configuration
if [ -f "${PROJECT_ROOT}/.env.cpanel" ]; then
    source "${PROJECT_ROOT}/.env.cpanel"
else
    echo -e "${RED}Error: .env.cpanel not found${NC}"
    exit 1
fi

BACKUP_TIMESTAMP="${1:-}"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

list_backups() {
    log_info "Available backups:"
    ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" << 'ENDSSH'
ls -lt ${DEPLOY_PATH}_backup_* 2>/dev/null | head -10 || echo "No backups found"
ENDSSH
}

rollback() {
    local backup_dir

    if [ -z "${BACKUP_TIMESTAMP}" ]; then
        # Get most recent backup
        backup_dir=$(ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
            "ls -dt ${DEPLOY_PATH}_backup_* 2>/dev/null | head -1")

        if [ -z "${backup_dir}" ]; then
            log_error "No backups found"
            exit 1
        fi
    else
        backup_dir="${DEPLOY_PATH}_backup_${BACKUP_TIMESTAMP}"
    fi

    log_info "Rolling back to: ${backup_dir}"

    # Confirm rollback
    read -p "Are you sure you want to rollback? (yes/no): " confirm
    if [ "${confirm}" != "yes" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi

    # Perform rollback
    log_info "Performing rollback..."
    ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" << ENDSSH
# Create backup of current state
CURRENT_BACKUP="${DEPLOY_PATH}_before_rollback_\$(date +%Y%m%d_%H%M%S)"
cp -r "${DEPLOY_PATH}" "\${CURRENT_BACKUP}"
echo "Current state backed up to \${CURRENT_BACKUP}"

# Restore from backup
rm -rf "${DEPLOY_PATH}"
cp -r "${backup_dir}" "${DEPLOY_PATH}"

# Restart application
cd "${DEPLOY_PATH}"

# PM2 restart
if command -v pm2 &> /dev/null; then
    pm2 restart ihep-app
fi

# Passenger restart
mkdir -p tmp
touch tmp/restart.txt

echo "Rollback completed"
ENDSSH

    log_success "Rollback completed successfully"
}

main() {
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}IHEP cPanel Rollback${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""

    if [ -z "${BACKUP_TIMESTAMP}" ]; then
        list_backups
        echo ""
    fi

    rollback

    echo ""
    log_info "Please verify the application at: https://ihep.app"
}

main
