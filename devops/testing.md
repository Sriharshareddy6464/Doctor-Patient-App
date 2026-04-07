# Testing & Validation Log
> Doctor-Patient App (Oshadhi) | DevOps Testing Record
> covers Phase 1 local , Phase 2 Docker , Phase 3 EC2 , Phase 4 CI/CD

---

## Phase 1 — Local Verification

### Environment
- OS: Windows 11
- Node.js: v22.13.1
- npm: v11.5.2
- PostgreSQL: v18.1 (local)

### Test Results

#### Auth Flow
| Test | Expected | Result |
|------|----------|--------|
| Register as Patient | Lands on patient dashboard | ✅ Pass |
| Register as Doctor | Does NOT auto-login (pending approval) | ✅ Pass |
| Login as Admin | Lands on admin dashboard | ✅ Pass |
| Login with wrong password | Blocked with error | ✅ Pass |
| Login as unapproved doctor | Gets pending message | ✅ Pass |
| Login as rejected doctor | Gets rejection message | ✅ Pass |
| Silent token refresh | Refreshes without re-login | ✅ Pass |

#### Admin Flow
| Test | Expected | Result |
|------|----------|--------|
| Dashboard loads with stats | Platform stats visible | ✅ Pass |
| Pending doctors list renders | List appears | ✅ Pass |
| Approve doctor | Doctor can now login | ✅ Pass |
| Reject doctor | Rejection message on login | ✅ Pass |
| Activate / Deactivate doctor | Status updates correctly | ✅ Pass |
| List all patients | Renders correctly | ✅ Pass |
| List all appointments | Renders correctly | ✅ Pass |
| Cancel appointment | Status updates | ✅ Pass |

#### Doctor Flow
| Test | Expected | Result |
|------|----------|--------|
| Approved doctor login | Successful | ✅ Pass |
| Doctor profile edit | Saves correctly | ✅ Pass |
| Generate 30-min slots | Slots appear in system | ✅ Pass |
| Appointments list loads | Renders correctly | ✅ Pass |
| Join video call | Agora token generated | ✅ Pass |
| End call | Appointment status updates | ✅ Pass |

#### Patient Flow
| Test | Expected | Result |
|------|----------|--------|
| Browse doctor directory | Only active + approved shown | ✅ Pass |
| View doctor detail | Renders correctly | ✅ Pass |
| See available slots | Slots visible on booking page | ✅ Pass |
| Book appointment | Mock payment completes | ✅ Pass |
| Appointments list loads | Renders correctly | ✅ Pass |
| Join video call | Agora token generated | ✅ Pass |
| End call | Appointment status updates | ✅ Pass |

### Issues Found & Fixed

#### Issue 1 — Admin Password Hardcoded
- **Found:** `Admin@1234` hardcoded in `auth.service.ts`
- **Risk:** Anyone reading source code knows admin password
- **Fix:** Moved to `ADMIN_PASSWORD` env var via `env.ts`
- **Status:** ✅ Fixed

#### Issue 2 — ts-node-dev EPERM on Windows
- **Found:** `npm run dev` fails on Windows with spawn EPERM error
- **Cause:** Windows sandbox restriction with `ts-node-dev`
- **Fix:** Changed dev script to `npx tsc && node dist/server.js`
- **Status:** ✅ Fixed

#### Issue 3 — frontend/.env Not Git Ignored
- **Found:** `frontend/.env` untracked, risk of accidental commit
- **Fix:** Added `.env` entries to `frontend/.gitignore`
- **Status:** ✅ Fixed

### Phase 1 Sign-off
- ✅ All 3 roles verified end-to-end
- ✅ Video call token generation confirmed
- ✅ No unhandled 500 errors in backend logs
- ✅ All fixes committed and merged to client main

---

## Phase 2 — Docker Compose

### Environment
- Docker: v28.4.0
- Docker Compose: v2.39.2
- OS: Windows 11

### Test Results

| Test | Expected | Result |
|------|----------|--------|
| `docker compose build` | All images build successfully | ✅ Pass |
| `docker compose up -d` | All 3 containers start | ✅ Pass |
| `oshadhi_db` healthcheck | Postgres healthy on port 5433 | ✅ Pass |
| `oshadhi_backend` startup | Migrations run, server starts | ✅ Pass |
| `oshadhi_frontend` startup | Nginx serves React on port 80 | ✅ Pass |
| `http://localhost:5000/health` | Returns success | ✅ Pass |
| `http://localhost` | Returns 200 | ✅ Pass |
| `http://localhost/api/auth/login` | Proxied through Nginx | ✅ Pass |
| Prisma migrations on startup | All 5 applied automatically | ✅ Pass |
| Admin seed on first run | Admin created | ✅ Pass |
| Admin seed on restart | Skipped (duplicate guard works) | ✅ Pass |

### Issues Found & Fixed

#### Issue 1 — Backend Image Build Failed
- **Found:** COPY path for Prisma folder was wrong in `backend/Dockerfile`
- **Fix:** Corrected COPY paths to match actual folder structure
- **Status:** ✅ Fixed

#### Issue 2 — prisma migrate deploy Crashed
- **Found:** `prisma.config.ts` not copied into image
- **Fix:** Added `prisma.config.ts` to COPY in `backend/Dockerfile`
- **Status:** ✅ Fixed

#### Issue 3 — Blank Env Vars in Compose
- **Found:** `${...}` vars resolving as empty in compose
- **Cause:** `env_file` path was incorrect
- **Fix:** Fixed `env_file` path in `docker-compose.yaml`
- **Status:** ✅ Fixed

#### Issue 4 — Port 5432 Conflict
- **Found:** DB container failed to bind port 5432
- **Cause:** Local PostgreSQL already running on 5432
- **Fix:** Mapped DB container to host port `5433`
- **Status:** ✅ Fixed

#### Issue 5 — Hardcoded Postgres Password (GitGuardian)
- **Found:** GitGuardian flagged `POSTGRES_PASSWORD: oshadhi123` in `docker-compose.yaml`
- **Risk:** Password exposed in git history
- **Fix:**
  - Replaced hardcoded values with `${POSTGRES_DB}`, `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`
  - Created root `.env` (gitignored) for Docker Compose to read
  - Created root `.env.example` for documentation
- **Status:** ✅ Fixed

### Phase 2 Sign-off
- ✅ All 3 containers running cleanly
- ✅ No hardcoded secrets in any committed file
- ✅ `docker compose up -d` works without extra flags
- ✅ GitGuardian warning resolved

---

## Phase 3 — AWS EC2 Deployment

### Environment
- EC2: Ubuntu 24, t3.medium
- Docker: latest (EC2)
- Elastic IP: assigned and attached
- Deployment: Image-based (DockerHub)

### Deployment Flow

Local → Build Image → Push to DockerHub → EC2 Pull → Run Containers

### DockerHub Images
| Image | Repository |
|-------|-----------|
| Backend | `sriharshareddy6464/doc-backend:latest` |
| Frontend | `sriharshareddy6464/doc-frontend:latest` |
| Database | `postgres:16-alpine` (official) |

### Test Results

| Test | Expected | Result |
|------|----------|--------|
| `docker compose pull` | All images pulled from DockerHub | ✅ Pass |
| `docker compose up -d` | All 3 containers start | ✅ Pass |
| `oshadhi_db` healthcheck | Healthy on port 5433 | ✅ Pass |
| `oshadhi_backend` on port 5000 | Running | ✅ Pass |
| `oshadhi_frontend` on port 80 | Running | ✅ Pass |
| `curl http://localhost:5000/health` | `{"success":true}` | ✅ Pass |
| `curl http://localhost` | React app HTML | ✅ Pass |
| `curl http://localhost/api/auth/login` | Proxied correctly | ✅ Pass |
| Public IP accessible | App loads in browser | ✅ Pass |

### Issues Found & Fixed

#### Issue 1 — Docker Installation Failure
- **Found:** `docker-ce` packages not found on Ubuntu 24
- **Cause:** Wrong repository version mapping
- **Fix:** Reconfigured Docker APT repo for correct Ubuntu version
- **Status:** ✅ Fixed

#### Issue 2 — Docker Daemon Failure
- **Found:** Docker not starting, containerd snapshot errors
- **Fix:** Restarted services, cleaned corrupted runtime state, reinitialized Docker
- **Status:** ✅ Fixed

#### Issue 3 — Application Not Reachable
- **Found:** Site not loading despite containers running
- **Cause:** Missing security group rules for ports 80 and 5000
- **Fix:** Opened ports 80 and 5000 in EC2 security group
- **Status:** ✅ Fixed

#### Issue 4 — Public IP Changed After EC2 Restart
- **Found:** Application broke after EC2 restart
- **Cause:** EC2 assigns new public IP on every restart
- **Fix:** Allocated and attached Elastic IP for stable endpoint
- **Status:** ✅ Fixed

#### Issue 5 — Frontend Not Connecting to Backend
- **Found:** API calls failing in browser
- **Cause:** `VITE_API_URL` hardcoded with old IP in frontend build
- **Fix:** Rebuilt frontend image with correct API URL, pushed to DockerHub
- **Status:** ✅ Fixed

#### Issue 6 — Prisma ESM / CommonJS Conflict
- **Found:** Backend crash-looping with:
  `SyntaxError: Cannot use 'import.meta' outside a module`
- **Cause:** `schema.prisma` used `provider = "prisma-client"` which generates
  ESM client. Backend runs as CommonJS — conflict.
- **Fix:** Changed to `provider = "prisma-client-js"` in `schema.prisma`
  Rebuilt and pushed new backend image to DockerHub
- **Status:** ✅ Fixed

### Phase 3 Sign-off
- ✅ All 3 containers running on EC2
- ✅ Application accessible via Elastic IP
- ✅ No source code on server — image-based deployment
- ✅ `.env` configured once on EC2, never touched again

---

## Phase 4 — CI/CD Pipeline (GitHub Actions)

### Environment
- GitHub Actions
- DockerHub (image registry)
- EC2 (deployment target)

### Pipeline Architecture

Push to main
↓
Backend CI (if backend/** changed)
→ Build backend image
→ Push to DockerHub
Frontend CI (if frontend/** changed)
→ Build frontend image
→ Push to DockerHub
↓
CD (after CI success)
→ SSH into EC2
→ docker compose pull
→ docker compose up -d --force-recreate

### Branch Strategy
| Branch | CI | CD |
|--------|----|----|
| `staging` | ✅ Runs | ❌ No deploy |
| `main` | ✅ Runs | ✅ Deploys to EC2 |

### GitHub Secrets Configured
| Secret | Purpose |
|--------|---------|
| `DOCKERHUB_USERNAME` | DockerHub login |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `EC2_SSH_KEY` | `.pem` key for SSH into EC2 |
| `EC2_HOST` | EC2 Elastic IP |
| `EC2_USER` | EC2 username (`ubuntu`) |

### Test Results

| Test | Expected | Result |
|------|----------|--------|
| Backend CI on staging push | Builds and pushes image | ✅ Pass |
| Frontend CI on staging push | Builds and pushes image | ✅ Pass |
| CD on staging push | Does NOT deploy | ✅ Pass |
| Backend CI on main push | Builds and pushes image | ✅ Pass |
| Frontend CI on main push | Builds and pushes image | ✅ Pass |
| CD on main push | SSHs into EC2, pulls, restarts | ✅ Pass |
| Manual trigger `workflow_dispatch` | Pipeline runs on demand | ✅ Pass |
| EC2 updated after CD | New containers running | ✅ Pass |

### Issues Found & Fixed

#### Issue 1 — DockerHub Authentication Failed
- **Found:** Login failed using DockerHub password
- **Fix:** Generated DockerHub Access Token, used as `DOCKERHUB_TOKEN` secret
- **Status:** ✅ Fixed

#### Issue 2 — SSH Access Failed in GitHub Actions
- **Found:** EC2 SSH connection failed
- **Fix:** Stored `.pem` contents as `EC2_SSH_KEY` secret, configured SSH correctly in workflow
- **Status:** ✅ Fixed

#### Issue 3 — Workflow Not Triggering
- **Found:** CI not running on test commits
- **Cause:** `paths` filter — commits not touching `backend/` or `frontend/`
- **Fix:** Made trigger commits inside correct directories
- **Status:** ✅ Fixed

#### Issue 4 — GitHub Secrets Missing on Client Repo
- **Found:** Workflows failing — secrets not configured on client repository
- **Cause:** Secrets were set on fork, not on client repo
- **Fix:** Logged into client GitHub account, added all required secrets
- **Status:** ✅ Fixed

#### Issue 5 — Risk of Deploying from Staging
- **Found:** CD could potentially deploy from staging branch
- **Fix:** Enforced CD runs on `main` only via branch condition in workflow
- **Status:** ✅ Fixed

### Phase 4 Sign-off
- ✅ Fully automated pipeline end-to-end
- ✅ Secure secret management via GitHub Secrets
- ✅ CD restricted to main branch only
- ✅ No manual SSH required for deployments
- ✅ Frontend dev informed — carry on with feature work

---

## Overall System Status

Local Dev        → ✅ Verified
Containerization → ✅ Verified
Cloud Deployment → ✅ Verified
CI/CD Automation → ✅ Verified

### Live Endpoints
| Endpoint | Status |
|----------|--------|
| `http://<elastic-ip>` | ✅ React app |
| `http://<elastic-ip>:5000/health` | ✅ Backend health |
| `http://<elastic-ip>/api/*` | ✅ Proxied via Nginx |

---

## Next Scope 
- [ ] HTTPS via SSL certificate (required for Agora video calls in production)
- [ ] Domain name integration
- [ ] Image version tagging (avoid `latest` in production)
- [ ] Database backup strategy
- [ ] Basic monitoring and alerting setup