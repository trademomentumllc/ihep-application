# CI/CD Pipeline Documentation

**Last Updated:** January 7, 2026
**Author:** Jason M Jarmacz <jason@ihep.app>

---

## Overview

The IHEP application uses GitHub Actions for continuous integration and deployment. This document describes the CI/CD pipeline configuration and troubleshooting.

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Purpose:** Validate code quality, security, and functionality on every PR.

**Triggers:**
- Pull requests to `main` or `dev` branches
- Pushes to `main` or `dev` branches
- Only runs when files in `ihep-application/` change

**Jobs:**

#### Lint & Type Check
```yaml
runs: npm run lint && npm run check
```
- ESLint validation
- TypeScript type checking
- Non-blocking lint errors (continue-on-error)

#### Test
```yaml
runs: npm test
```
- Runs test suite if available
- Non-blocking (continue-on-error)
- Uses Vitest for unit/integration tests

#### Build
```yaml
runs: npm run build
```
- Production build with Next.js
- Validates `.next` directory created
- **BLOCKING** - Must pass for PR to merge
- Reports build size

#### Security Scan
```yaml
runs: npm audit
```
- npm audit for high-severity vulnerabilities
- Scans for hardcoded secrets/API keys
- Non-blocking (informational only)

#### PQC Validation
```yaml
runs: vitest src/lib/crypto/__tests__/
```
- Validates post-quantum cryptography implementation
- Runs Kyber/Dilithium/encryption tests
- Non-blocking (informational only)

#### Summary
- Consolidates all job results
- Creates GitHub Actions summary
- Fails if build job fails
- Warns if type check fails

**Status:** ✅ Active

---

### 2. Claude Code Review (`claude-code-review.yml`)

**Purpose:** Automated code review using Claude AI on every PR.

**Triggers:**
- Pull request opened
- Pull request synchronized (new commits)

**Features:**
- Installs GitHub CLI if not present
- Authenticates with `GITHUB_TOKEN`
- Posts review comments to PR
- **Non-blocking** - Won't fail the PR if review encounters errors
- Focus areas:
  - Security vulnerabilities (XSS, injection, secrets)
  - HIPAA compliance for PHI handling
  - Type safety issues
  - Performance bottlenecks
  - PQC implementation validation (no simulations)

**Permissions Required:**
- `contents: read` - Read repository code
- `pull-requests: write` - Post PR comments
- `issues: write` - Create/update issues
- `id-token: write` - OIDC authentication

**Secrets Required:**
- `CLAUDE_CODE_OAUTH_TOKEN` - Claude API authentication
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

**Status:** ✅ Active (Fixed 2026-01-07)

**Previous Issues (RESOLVED):**
- ❌ Missing gh CLI installation → ✅ Now installs automatically
- ❌ Insufficient permissions (read-only) → ✅ Changed to write
- ❌ Blocking PRs on failure → ✅ Now non-blocking with graceful degradation
- ❌ Missing GH_TOKEN env var → ✅ Explicitly configured

---

### 3. Deployment Workflows

#### Development (`web-deploy-dev.yml`)
- Triggers: Push to `dev` branch
- Deploys to: Cloud Run (dev environment)
- Docker build and push to Artifact Registry
- Health checks after deployment

#### Staging (`web-deploy-staging.yml`)
- Triggers: Push to `staging` branch
- Deploys to: Cloud Run (staging environment)
- Pre-production validation

#### Production (`web-deploy-production.yml`)
- Triggers: Manual (workflow_dispatch)
- Deploys to: Cloud Run (production environment)
- Requires manual approval

**Status:** ✅ Active

---

### 4. Security Workflows

#### CodeQL Analysis (`codeql-analysis.yml`)
- Weekly security scanning
- Static analysis for vulnerabilities
- Language: JavaScript/TypeScript

#### OSSAR (`ossar.yml`)
- Open Source Security Analysis
- Detects security issues in dependencies

#### OSV Scanner (`osv-scanner.yml`)
- Scans for known vulnerabilities in dependencies
- Checks against OSV database

**Status:** ✅ Active

---

## Troubleshooting

### CI Build Failures

**Symptom:** "Build failed - .next directory not found"

**Cause:** Next.js build errors (TypeScript, syntax, missing dependencies)

**Solution:**
1. Run `npm run build` locally
2. Fix TypeScript errors: `npm run check`
3. Check for missing dependencies: `npm install`
4. Review build logs in GitHub Actions

---

### Claude Code Review Not Posting Comments

**Symptom:** Claude runs but doesn't comment on PR

**Causes:**
1. Missing `CLAUDE_CODE_OAUTH_TOKEN` secret
2. Insufficient permissions
3. gh CLI not authenticated

**Solution:**
1. Verify secret exists in repo settings:
   - Settings → Secrets and variables → Actions
   - Ensure `CLAUDE_CODE_OAUTH_TOKEN` is set

2. Check workflow permissions:
   ```yaml
   permissions:
     pull-requests: write  # Must be write, not read
     issues: write
   ```

3. Check gh CLI authentication in logs:
   - Look for "✅ gh CLI authentication configured"
   - If missing, check GITHUB_TOKEN availability

**Note:** Claude Code Review is now non-blocking. If it fails, PRs can still be merged after manual review.

---

### Type Check Failures

**Symptom:** "Type check failed - Please fix TypeScript errors"

**Common Causes:**
1. Missing type definitions
2. Incorrect imports
3. `any` types without proper annotation
4. Strict mode violations

**Solution:**
1. Run locally: `npm run check`
2. Fix reported errors
3. Add type definitions: `npm install -D @types/package-name`
4. Use `unknown` instead of `any` when type is uncertain

---

### Security Audit Warnings

**Symptom:** npm audit reports vulnerabilities

**Triage:**
1. **High/Critical + Production:**
   - Fix immediately: `npm audit fix`
   - Or update specific package: `npm update package-name`

2. **High/Critical + Dev Dependency:**
   - Check if it affects build/runtime
   - Update when possible, but not blocking

3. **Moderate/Low:**
   - Review in weekly security review
   - Update during regular maintenance

**Current Status (2026-01-07):**
- 89 vulnerabilities detected
- 12 high, 33 moderate, 44 low
- Most are transitive/dev dependencies
- Non-blocking for deployment

---

### PQC Tests Failing

**Symptom:** Post-quantum cryptography tests fail

**Common Issues:**

1. **"object is not iterable"**
   ```typescript
   // ❌ Wrong
   const [publicKey, secretKey] = ml_kem768.keygen()

   // ✅ Correct
   const { publicKey, secretKey } = ml_kem768.keygen()
   ```

2. **"hkdf is not a function"**
   ```typescript
   // ❌ Wrong
   import { hkdf } from '@stablelib/hkdf'

   // ✅ Correct
   import { HKDF } from '@stablelib/hkdf'
   const hkdf = new HKDF(SHA512, key, salt, info)
   ```

3. **"secretKey expected length X, got length Y"**
   - Use serialization functions: `serializeKeyPair()` / `deserializeKeyPair()`

---

## CI/CD Best Practices

### For Developers

1. **Before Creating PR:**
   ```bash
   npm run lint          # Fix linting issues
   npm run check         # Fix type errors
   npm run build         # Ensure build succeeds
   npm test              # Run tests locally
   ```

2. **During PR Review:**
   - Address CI failures before requesting review
   - Check Claude Code Review comments
   - Respond to security warnings

3. **Before Merging:**
   - Ensure all required checks pass (Build, Type Check)
   - Review optional check warnings (Security, Tests)
   - Get manual approval if Claude Code Review failed

### For Reviewers

1. **Check CI Status:**
   - ✅ Build must pass
   - ⚠️ Review lint/type warnings
   - ℹ️ Note security scan results

2. **Review Claude Comments:**
   - Address critical security issues
   - Consider code quality suggestions
   - Discuss architecture concerns

3. **Manual Testing:**
   - Pull branch locally for complex changes
   - Test critical user flows
   - Verify PQC implementations (no simulations)

---

## Workflow Configuration

### Adding New CI Checks

1. Edit `.github/workflows/ci.yml`
2. Add new job:
   ```yaml
   new-check:
     name: New Check
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - name: Run check
         run: npm run new-check
   ```
3. Add to summary job's `needs` array

### Modifying Claude Code Review

1. Edit `.github/workflows/claude-code-review.yml`
2. Update `prompt` section for different focus areas
3. Adjust `claude_args` to allow/restrict tools
4. Test with a draft PR

---

## Monitoring

### GitHub Actions Dashboard
- Repository → Actions tab
- Filter by workflow name
- Check run history and trends

### CI Metrics
- Build success rate: Target >95%
- Average build time: ~5-10 minutes
- Test coverage: Target >80%

### Alerts
- GitHub automatically notifies on workflow failures
- Review weekly Dependabot alerts
- Monitor security scan results

---

## Recent Changes

### 2026-01-07: CI Pipeline Improvements
- ✅ Added comprehensive CI workflow
- ✅ Fixed Claude Code Review with gh CLI installation
- ✅ Made Claude review non-blocking
- ✅ Added PQC validation job
- ✅ Improved error messages and summaries

### 2026-01-05: Legal Documents
- Added Terms of Service validation
- Added Privacy Policy compliance checks

---

## Support

**Issues:**
- GitHub Actions failures: Check logs in Actions tab
- CI/CD questions: Review this document first
- Claude Code Review issues: Check Anthropic status page

**Contacts:**
- DevOps: jason@ihep.app
- Security: security@ihep.app

---

**Version:** 1.0
**Last Review:** January 7, 2026
**Next Review:** April 7, 2026
