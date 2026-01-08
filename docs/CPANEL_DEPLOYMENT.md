# IHEP cPanel Deployment Guide

**Author:** Jason M Jarmacz | Evolution Strategist | jason@ihep.app
**Co-Author:** Claude by Anthropic
**Date:** January 8, 2026
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Deployment Methods](#deployment-methods)
5. [GitHub Actions Automated Deployment](#github-actions-automated-deployment)
6. [Manual Deployment](#manual-deployment)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

This guide covers deploying the IHEP Next.js application to cPanel hosting at **ihep.app** (162.215.85.33). The application requires Node.js runtime support, which is available through cPanel's Node.js Application feature.

### Infrastructure

- **Domain:** ihep.app
- **Server IP:** 162.215.85.33
- **Hosting:** cPanel environment
- **Web Server:** Apache 2.4+ with mod_proxy
- **Node.js Version:** 22.x
- **Application Port:** 3000 (proxied via Apache)

### Deployment Architecture

```
┌─────────────────┐
│  GitHub Repo    │
│  (main branch)  │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────────────┐
│  GitHub Actions         │
│  - Build Next.js app    │
│  - Run tests            │
│  - Create deployment pkg│
└────────┬────────────────┘
         │ rsync via SSH
         ▼
┌─────────────────────────┐
│  cPanel Server          │
│  162.215.85.33          │
│  /home/ihepapp/         │
│    public_html/         │
│  - Install deps         │
│  - Restart Node.js app  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Apache Reverse Proxy   │
│  :80/:443 → :3000       │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  https://ihep.app       │
└─────────────────────────┘
```

---

## Prerequisites

### Local Development Machine

- **Git** installed and configured
- **Node.js 22+** and npm
- **SSH client** (OpenSSH, PuTTY, etc.)
- **rsync** (for file synchronization)

### cPanel Server Requirements

- **cPanel account** with SSH access enabled
- **Node.js Application** feature enabled in cPanel
- **Node.js 22.x** installed via cPanel Node.js Selector
- **PM2** or Passenger for process management
- **SSH access** via public key authentication
- **Sufficient disk space** (minimum 2GB for application + dependencies)

### Access Requirements

- SSH private key for authentication
- cPanel username and password (for initial setup)
- Domain DNS configured (A record pointing to 162.215.85.33)

---

## Initial Setup

### 1. Configure SSH Access

#### Generate SSH Key Pair

```bash
# Generate SSH key specifically for cPanel deployment
ssh-keygen -t ed25519 -f ~/.ssh/ihep_cpanel_rsa -C "deploy@ihep.app"

# Secure the private key
chmod 600 ~/.ssh/ihep_cpanel_rsa
chmod 644 ~/.ssh/ihep_cpanel_rsa.pub
```

#### Add Public Key to cPanel

1. Log into cPanel at `https://162.215.85.33:2083`
2. Navigate to **Security → SSH Access**
3. Click **Manage SSH Keys**
4. Click **Import Key**
5. Paste contents of `~/.ssh/ihep_cpanel_rsa.pub`
6. Click **Import**
7. Click **Manage** next to the imported key
8. Click **Authorize** to enable the key

#### Test SSH Connection

```bash
ssh -i ~/.ssh/ihep_cpanel_rsa ihepapp@162.215.85.33

# If successful, you should see the cPanel welcome message
# Exit with: exit
```

### 2. Configure Node.js in cPanel

#### Enable Node.js Application

1. Log into cPanel
2. Navigate to **Software → Setup Node.js App**
3. Click **Create Application**
4. Configure:
   - **Node.js version:** 22.x
   - **Application mode:** Production
   - **Application root:** `/home/ihepapp/public_html`
   - **Application URL:** `ihep.app`
   - **Application startup file:** `server.js` or `npm start`
   - **Port:** 3000

5. Click **Create**

#### Configure Environment Variables

In the Node.js Application settings, add:

```bash
NODE_ENV=production
PORT=3000
NEXTAUTH_SECRET=<generate-secure-secret>
DATABASE_URL=<your-database-url>
NEXT_PUBLIC_APP_URL=https://ihep.app
```

### 3. Configure Apache Reverse Proxy

cPanel's Node.js Application should automatically configure Apache, but verify the `.htaccess` file:

**Location:** `/home/ihepapp/public_html/.htaccess`

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy to Node.js application
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
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
```

### 4. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CPANEL_HOST` | `162.215.85.33` | cPanel server IP/hostname |
| `CPANEL_USERNAME` | `ihepapp` | cPanel username |
| `CPANEL_SSH_KEY` | `<private-key-contents>` | Full contents of `~/.ssh/ihep_cpanel_rsa` |
| `CPANEL_DEPLOY_PATH` | `/home/ihepapp/public_html` | Deployment directory |

**Optional secrets:**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFLARE_ZONE_ID` | Your zone ID | For CDN cache purging |
| `CLOUDFLARE_API_TOKEN` | Your API token | For CDN cache purging |

### 5. Create Local Configuration

Create `.env.cpanel` in the repository root (DO NOT commit to Git):

```bash
cp .env.cpanel.example .env.cpanel

# Edit with your values
nano .env.cpanel
```

**Example `.env.cpanel`:**

```bash
CPANEL_HOST=162.215.85.33
CPANEL_USERNAME=ihepapp
CPANEL_SSH_KEY_PATH=~/.ssh/ihep_cpanel_rsa
DEPLOY_PATH=/home/ihepapp/public_html
NODE_VERSION=22
NODE_ENV=production
APP_PORT=3000
APP_URL=https://ihep.app
```

---

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

**Automatic deployment on push to main/production branches.**

#### Trigger Deployment

```bash
# Deploy to production
git checkout main
git push origin main

# Or manually trigger workflow
gh workflow run cpanel-deploy.yml
```

The GitHub Actions workflow (`.github/workflows/cpanel-deploy.yml`) will:

1. ✅ Checkout repository
2. ✅ Install dependencies
3. ✅ Build Next.js application
4. ✅ Create deployment package
5. ✅ Backup current deployment
6. ✅ Sync files via rsync over SSH
7. ✅ Install production dependencies on server
8. ✅ Restart Node.js application
9. ✅ Verify deployment
10. ✅ Send deployment notification

#### Monitor Deployment

```bash
# View workflow runs
gh run list --workflow=cpanel-deploy.yml

# View specific run logs
gh run view <run-id> --log
```

### Method 2: Manual Deployment Script

**For one-off deployments or testing.**

```bash
# Deploy to production
./scripts/cpanel/deploy.sh production

# Deploy to staging (if configured)
./scripts/cpanel/deploy.sh staging
```

The script will:

1. ✅ Check prerequisites
2. ✅ Build application locally
3. ✅ Create deployment package
4. ✅ Backup remote deployment
5. ✅ Sync files to server
6. ✅ Configure remote server
7. ✅ Restart application
8. ✅ Verify deployment

### Method 3: Direct cPanel Git Deployment

**For simple updates without CI/CD.**

#### Setup

1. Log into cPanel
2. Navigate to **Files → Git Version Control**
3. Click **Create**
4. Configure:
   - **Clone URL:** `https://github.com/OmniUnumCo/ihep-application.git`
   - **Repository path:** `/home/ihepapp/repositories/ihep-application`
   - **Repository name:** `ihep-application`
5. Click **Create**

#### Deploy

1. In cPanel Git Version Control, click **Manage** for your repository
2. Click **Pull or Deploy** → **Update from Remote**
3. The `.cpanel.yml` file will automatically:
   - Copy files to `public_html`
   - Install dependencies
   - Build application
   - Restart Node.js app

---

## GitHub Actions Automated Deployment

### Workflow File

**Location:** `.github/workflows/cpanel-deploy.yml`

### Trigger Conditions

- **Push to branches:** `main`, `production`, `claude/sync-cpanel-deployment-*`
- **Manual trigger:** Via GitHub Actions UI or `gh workflow run`

### Workflow Steps

1. **Build Stage**
   - Checkout repository
   - Setup Node.js 22
   - Install dependencies with `npm ci`
   - Build Next.js with `npm run build`

2. **Package Stage**
   - Create deployment directory
   - Copy `.next`, `public`, `package.json`, etc.
   - Generate `.htaccess`
   - Create deployment metadata

3. **Deploy Stage**
   - Setup SSH with private key
   - Add server to known hosts
   - Create backup on remote server
   - Sync files via rsync
   - Install dependencies on server
   - Set file permissions
   - Restart Node.js application

4. **Verify Stage**
   - Wait for application restart
   - HTTP health check
   - Display deployment info

5. **Post-Deployment**
   - Security scan
   - Clear CDN cache (if configured)
   - Warm up cache

### Environment Variables

Set in workflow file or GitHub repository variables:

- `NODE_VERSION`: `22`
- `DEPLOY_PATH`: `/home/ihepapp/public_html`

### Secrets Required

- `CPANEL_HOST`
- `CPANEL_USERNAME`
- `CPANEL_SSH_KEY`

---

## Manual Deployment

### Prerequisites Check

```bash
# Verify all tools are installed
./scripts/cpanel/deploy.sh --check
```

### Deployment Process

```bash
# 1. Ensure you're on the correct branch
git checkout main
git pull origin main

# 2. Run deployment script
./scripts/cpanel/deploy.sh production

# 3. Monitor deployment output
# Script will show progress for each step

# 4. Verify deployment
curl -I https://ihep.app
```

### What the Script Does

1. **Pre-flight Checks**
   - Verifies Node.js, npm, rsync installed
   - Tests SSH connection
   - Validates configuration

2. **Build Application**
   - `npm ci` - Clean dependency install
   - `npm run build` - Production build

3. **Prepare Package**
   - Copies `.next/`, `public/`, config files
   - Creates `.htaccess`
   - Generates deployment metadata

4. **Backup Remote**
   - Creates timestamped backup on server
   - Keeps last 5 backups

5. **Deploy**
   - Syncs files via rsync
   - Excludes `node_modules`, `.git`, `.env*`

6. **Configure Server**
   - Activates Node.js environment
   - Runs `npm install --production`
   - Sets file permissions (755 dirs, 644 files)
   - Restarts application (PM2 or Passenger)

7. **Verify**
   - HTTP health check
   - Displays deployment info

---

## Rollback Procedure

If a deployment causes issues, you can rollback to a previous version.

### List Available Backups

```bash
./scripts/cpanel/rollback.sh
```

Output:
```
Available backups:
/home/ihepapp/public_html_backup_20260108_143022
/home/ihepapp/public_html_backup_20260108_120515
/home/ihepapp/public_html_backup_20260107_160330
```

### Rollback to Most Recent Backup

```bash
./scripts/cpanel/rollback.sh
```

The script will:
1. Show available backups
2. Prompt for confirmation
3. Backup current state (before rollback)
4. Restore from backup
5. Restart application

### Rollback to Specific Backup

```bash
# Use timestamp from backup directory name
./scripts/cpanel/rollback.sh 20260108_120515
```

### Manual Rollback via SSH

```bash
ssh -i ~/.ssh/ihep_cpanel_rsa ihepapp@162.215.85.33

# List backups
ls -lt /home/ihepapp/public_html_backup_*

# Restore backup
cd /home/ihepapp
mv public_html public_html_failed_$(date +%Y%m%d_%H%M%S)
cp -r public_html_backup_20260108_143022 public_html

# Restart application
cd public_html
pm2 restart ihep-app
# OR
touch tmp/restart.txt

# Exit
exit
```

---

## Troubleshooting

### Issue: SSH Connection Failed

**Symptoms:** `Permission denied (publickey)` or connection timeout

**Solutions:**

1. **Verify SSH key is correct:**
   ```bash
   ssh -i ~/.ssh/ihep_cpanel_rsa -v ihepapp@162.215.85.33
   ```

2. **Check key permissions:**
   ```bash
   chmod 600 ~/.ssh/ihep_cpanel_rsa
   ```

3. **Verify key is authorized in cPanel:**
   - Log into cPanel → Security → SSH Access
   - Check that key is listed as "Authorized"

4. **Test with password authentication:**
   ```bash
   ssh ihepapp@162.215.85.33
   # Enter password when prompted
   ```

### Issue: Application Not Starting

**Symptoms:** Site shows 503 error or "Application is not running"

**Solutions:**

1. **Check Node.js application status in cPanel:**
   - Software → Setup Node.js App
   - Verify application status is "Running"

2. **Check application logs:**
   ```bash
   ssh ihepapp@162.215.85.33
   cd public_html
   tail -100 logs/app.log
   ```

3. **Manually restart application:**
   ```bash
   # Via PM2
   pm2 restart ihep-app
   pm2 logs ihep-app

   # Via Passenger
   mkdir -p tmp
   touch tmp/restart.txt
   ```

4. **Check for port conflicts:**
   ```bash
   netstat -tulpn | grep 3000
   # If another process is using port 3000, kill it or change APP_PORT
   ```

### Issue: Build Fails

**Symptoms:** `npm run build` fails during deployment

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 22.x
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for TypeScript errors:**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

4. **Check environment variables:**
   - Verify all required env vars are set in cPanel Node.js Application

### Issue: Static Files Not Serving

**Symptoms:** Images, CSS, JS not loading (404 errors)

**Solutions:**

1. **Verify `.htaccess` configuration:**
   ```bash
   cat /home/ihepapp/public_html/.htaccess
   ```

2. **Check file permissions:**
   ```bash
   find public_html -type f -exec chmod 644 {} \;
   find public_html -type d -exec chmod 755 {} \;
   ```

3. **Verify Next.js static file handling:**
   - Check that `public/` directory was deployed
   - Verify `_next/static/` directory exists

### Issue: Deployment Succeeds but Site Shows Old Version

**Symptoms:** Changes not visible after deployment

**Solutions:**

1. **Clear browser cache:**
   - Hard reload: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

2. **Clear CDN cache (if using Cloudflare):**
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer ${API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
   ```

3. **Verify deployment completed:**
   ```bash
   ssh ihepapp@162.215.85.33 "cat public_html/deployment-info.json"
   ```

4. **Restart Node.js application:**
   ```bash
   ssh ihepapp@162.215.85.33
   pm2 restart ihep-app
   ```

### Issue: Database Connection Fails

**Symptoms:** `ECONNREFUSED` or database errors in logs

**Solutions:**

1. **Verify DATABASE_URL is set:**
   - Check cPanel Node.js App environment variables

2. **Test database connection:**
   ```bash
   ssh ihepapp@162.215.85.33
   cd public_html
   node -e "const db = require('./src/lib/db'); db.testConnection();"
   ```

3. **Check database server status:**
   - If using Cloud SQL or external database, verify it's running
   - Check firewall rules allow connections from 162.215.85.33

---

## Best Practices

### 1. Always Test Locally First

```bash
# Build and test locally
npm run build
npm start

# Verify at http://localhost:3000
```

### 2. Use Staging Environment

Deploy to staging before production:

```bash
./scripts/cpanel/deploy.sh staging
```

### 3. Monitor Deployments

- Watch GitHub Actions workflow output
- Check application logs after deployment
- Verify critical functionality works

### 4. Backup Before Major Changes

```bash
# Manual backup via SSH
ssh ihepapp@162.215.85.33
cd /home/ihepapp
tar -czf public_html_manual_backup_$(date +%Y%m%d_%H%M%S).tar.gz public_html
```

### 5. Keep Dependencies Updated

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

### 6. Monitor Resource Usage

cPanel provides resource monitoring:
- **Metrics → Resource Usage**
- Watch for:
  - High CPU usage
  - Memory limits
  - Disk space

### 7. Enable Error Logging

In `.env.production` (on server):

```bash
LOG_LEVEL=error
SENTRY_DSN=<your-sentry-dsn>
```

### 8. Regular Security Updates

- Keep Node.js updated via cPanel Node.js Selector
- Update npm packages regularly
- Monitor GitHub Dependabot alerts

---

## Additional Resources

- **cPanel Documentation:** https://docs.cpanel.net/
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **IHEP Project Documentation:** `/docs/`

---

## Support

For deployment issues or questions:

- **Email:** jason@ihep.app
- **GitHub Issues:** https://github.com/OmniUnumCo/ihep-application/issues
- **Project Documentation:** `/docs/`

---

**Document Version:** 1.0.0
**Last Updated:** January 8, 2026
**Maintained By:** Jason M Jarmacz & Claude by Anthropic
