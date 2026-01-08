#!/bin/bash

###############################################################################
# IHEP cPanel Deployment Script
#
# This script deploys the IHEP Next.js application to cPanel hosting
# via SSH/SFTP. It builds the application locally and syncs to the server.
#
# Author: Jason M Jarmacz <jason@ihep.app>
# Co-Author: Claude by Anthropic <noreply@anthropic.com>
# Date: January 8, 2026
#
# Usage: ./scripts/cpanel/deploy.sh [environment]
#   environment: production (default) | staging
#
# Prerequisites:
#   - SSH key configured for cPanel access
#   - rsync installed
#   - Node.js 22+ installed locally
#   - Environment variables set (see .env.cpanel.example)
###############################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BUILD_DIR="${PROJECT_ROOT}/.cpanel-build"

# Load environment-specific configuration
if [ -f "${PROJECT_ROOT}/.env.cpanel.${ENVIRONMENT}" ]; then
    source "${PROJECT_ROOT}/.env.cpanel.${ENVIRONMENT}"
elif [ -f "${PROJECT_ROOT}/.env.cpanel" ]; then
    source "${PROJECT_ROOT}/.env.cpanel"
else
    echo -e "${RED}Error: Configuration file not found${NC}"
    echo "Please create .env.cpanel or .env.cpanel.${ENVIRONMENT}"
    exit 1
fi

# Validate required variables
REQUIRED_VARS=("CPANEL_HOST" "CPANEL_USERNAME" "CPANEL_SSH_KEY_PATH" "DEPLOY_PATH")
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR:-}" ]; then
        echo -e "${RED}Error: ${VAR} is not set${NC}"
        exit 1
    fi
done

###############################################################################
# Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi

    # Check rsync
    if ! command -v rsync &> /dev/null; then
        log_error "rsync is not installed"
        log_info "Install with: sudo apt-get install rsync (Ubuntu) or brew install rsync (macOS)"
        exit 1
    fi

    # Check SSH key
    if [ ! -f "${CPANEL_SSH_KEY_PATH}" ]; then
        log_error "SSH key not found at ${CPANEL_SSH_KEY_PATH}"
        exit 1
    fi

    # Test SSH connection
    if ! ssh -i "${CPANEL_SSH_KEY_PATH}" -o ConnectTimeout=5 -o BatchMode=yes \
        "${CPANEL_USERNAME}@${CPANEL_HOST}" "echo 'Connection test'" &> /dev/null; then
        log_error "Cannot connect to ${CPANEL_HOST}"
        log_info "Please verify SSH key and host configuration"
        exit 1
    fi

    log_success "All prerequisites met"
}

build_application() {
    log_info "Building Next.js application for ${ENVIRONMENT}..."

    cd "${PROJECT_ROOT}"

    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --prefer-offline --no-audit

    # Build application
    log_info "Building application..."
    NODE_ENV=production npm run build

    log_success "Build completed"
}

prepare_deployment_package() {
    log_info "Preparing deployment package..."

    # Clean and create build directory
    rm -rf "${BUILD_DIR}"
    mkdir -p "${BUILD_DIR}"

    # Copy necessary files
    log_info "Copying files to build directory..."

    # Copy Next.js build output
    cp -r "${PROJECT_ROOT}/.next" "${BUILD_DIR}/"
    cp -r "${PROJECT_ROOT}/public" "${BUILD_DIR}/"

    # Copy package files
    cp "${PROJECT_ROOT}/package.json" "${BUILD_DIR}/"
    cp "${PROJECT_ROOT}/package-lock.json" "${BUILD_DIR}/"
    cp "${PROJECT_ROOT}/next.config.mjs" "${BUILD_DIR}/"

    # Copy standalone build if it exists
    if [ -d "${PROJECT_ROOT}/.next/standalone" ]; then
        log_info "Copying standalone build..."
        cp -r "${PROJECT_ROOT}/.next/standalone/"* "${BUILD_DIR}/"
    fi

    # Create .htaccess
    log_info "Creating .htaccess..."
    cat > "${BUILD_DIR}/.htaccess" << 'EOF'
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy to Node.js application on port 3000
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

# HSTS for production
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
  Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>

# Prevent access to sensitive files
<FilesMatch "^\.env|^\.git|package-lock\.json|tsconfig\.json">
  Order allow,deny
  Deny from all
</FilesMatch>
EOF

    # Create deployment info
    cat > "${BUILD_DIR}/deployment-info.json" << EOF
{
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "${ENVIRONMENT}",
  "commit_sha": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "commit_message": "$(git log -1 --pretty=%B 2>/dev/null || echo 'unknown')",
  "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "deployed_by": "$(whoami)",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)"
}
EOF

    log_success "Deployment package prepared"
}

deploy_to_cpanel() {
    log_info "Deploying to cPanel (${ENVIRONMENT})..."

    # Create backup on remote server
    log_info "Creating backup on remote server..."
    ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" << ENDSSH
if [ -d "${DEPLOY_PATH}" ]; then
    BACKUP_DIR="${DEPLOY_PATH}_backup_\$(date +%Y%m%d_%H%M%S)"
    cp -r "${DEPLOY_PATH}" "\${BACKUP_DIR}"
    echo "Backup created at \${BACKUP_DIR}"

    # Keep only last 5 backups
    ls -dt ${DEPLOY_PATH}_backup_* 2>/dev/null | tail -n +6 | xargs rm -rf
fi
ENDSSH

    # Deploy via rsync
    log_info "Syncing files to server..."
    rsync -avz --progress \
        --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.env*' \
        --exclude='*.log' \
        --exclude='.DS_Store' \
        -e "ssh -i ${CPANEL_SSH_KEY_PATH} -o StrictHostKeyChecking=no" \
        "${BUILD_DIR}/" \
        "${CPANEL_USERNAME}@${CPANEL_HOST}:${DEPLOY_PATH}/"

    log_success "Files synced to server"
}

configure_remote_server() {
    log_info "Configuring remote server..."

    ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" << 'ENDSSH'
cd "${DEPLOY_PATH}"

# Activate Node.js version environment if available
# Adjust path based on your cPanel Node.js setup
if [ -f "/home/${CPANEL_USERNAME}/nodevenv/public_html/22/bin/activate" ]; then
    source "/home/${CPANEL_USERNAME}/nodevenv/public_html/22/bin/activate"
fi

# Install production dependencies
echo "Installing production dependencies..."
npm install --production --prefer-offline --no-audit

# Set correct permissions
echo "Setting file permissions..."
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Restart Node.js application
echo "Restarting application..."

# Method 1: PM2 (if installed)
if command -v pm2 &> /dev/null; then
    pm2 restart ihep-app 2>/dev/null || pm2 start npm --name "ihep-app" -- start
    pm2 save
    echo "Application restarted with PM2"
fi

# Method 2: Passenger (cPanel Node.js Application)
if [ ! -d "tmp" ]; then
    mkdir -p tmp
fi
touch tmp/restart.txt
echo "Passenger restart triggered"

echo "Remote configuration completed"
ENDSSH

    log_success "Remote server configured"
}

verify_deployment() {
    log_info "Verifying deployment..."

    # Wait for application to restart
    sleep 5

    # Check if site is accessible
    local URL="https://ihep.app"
    if [ "${ENVIRONMENT}" == "staging" ]; then
        URL="https://staging.ihep.app"
    fi

    if curl -f -s -I "${URL}" > /dev/null 2>&1; then
        log_success "Deployment verified: ${URL} is accessible"
    else
        log_warning "Could not verify ${URL}"
        log_info "Please check manually"
    fi

    # Display deployment info
    log_info "Deployment information:"
    ssh -i "${CPANEL_SSH_KEY_PATH}" "${CPANEL_USERNAME}@${CPANEL_HOST}" \
        "cat ${DEPLOY_PATH}/deployment-info.json 2>/dev/null || echo 'Deployment info not available'"
}

cleanup() {
    log_info "Cleaning up..."
    rm -rf "${BUILD_DIR}"
    log_success "Cleanup completed"
}

###############################################################################
# Main execution
###############################################################################

main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}IHEP cPanel Deployment${NC}"
    echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""

    check_prerequisites
    build_application
    prepare_deployment_package
    deploy_to_cpanel
    configure_remote_server
    verify_deployment
    cleanup

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    log_info "URL: https://ihep.app"
    log_info "Check deployment logs on server: ${DEPLOY_PATH}/deployment.log"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main
