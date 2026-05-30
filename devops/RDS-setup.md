# DoctorOnCall — RDS Migration Reference
**Version:** v2.0.0 | **Status:** Complete

---

## Architecture

### Before
````
EC2
├── Frontend Container
├── Backend Container
└── PostgreSQL Container   ← single point of failure
````

### After
````
EC2                        Amazon RDS
├── Frontend Container     └── PostgreSQL (managed)
└── Backend Container
````

---

## AWS Setup

### 1. RDS Instance
| Property | Value |
|---|---|
| Engine | PostgreSQL |
| Instance Name | `doctoroncall-db` |
| Database Name | `doctor_patient_app` |
| Port | `5432` |
| Deployment | Single AZ |

### 2. Security Groups

**EC2 SG** (`ec2-rds-1`) — Outbound:
````
TCP 5432 → RDS Security Group
````

**RDS SG** (`rds-ec2-1`) — Inbound:
````
TCP 5432 ← EC2 Security Group
````

### 3. Verify Connectivity
```bash
psql \
  -h doctoroncall-db.xxxxx.ap-northeast-1.rds.amazonaws.com \
  -U postgres \
  -d doctor_patient_app
```

---

## Code Changes

### `backend/src/config/prisma.ts`

**Before**
```ts
const pool = new Pool({ connectionString });
```

**After**
```ts
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }   // ← required for RDS
});
```

> **Why:** RDS enforces SSL. Without this, Prisma throws a misleading `P1010` auth error even when credentials and connectivity are valid.

---

### `docker-compose.yml`

**Remove** the `db` service block:
```yaml
# DELETE THIS
db:
  image: postgres:16-alpine
  ...
```

**Remove** the volume:
```yaml
# DELETE THIS
volumes:
  postgres_data:
```

**Remove** the backend dependency:
```yaml
# DELETE THIS
depends_on:
  db:
    condition: service_healthy
```

**Update** the backend `DATABASE_URL`:
```yaml
# Before
DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# After
DATABASE_URL: ${DATABASE_URL}
```

---

## Environment Variables

**Before**
```env
POSTGRES_DB=doctor_patient_app
POSTGRES_USER=oshadhi_user
POSTGRES_PASSWORD=********
```

**After**
```env
DATABASE_URL=postgresql://postgres:<password>@doctoroncall-db.xxxxx.ap-northeast-1.rds.amazonaws.com:5432/doctor_patient_app
```

---

## Deploy

```bash
# Build & push new backend image
docker build -t sriharshareddy6464/doc-backend:v1.2.1 ./backend
docker push sriharshareddy6464/doc-backend:v1.2.1

# Redeploy stack
docker compose down
docker compose pull
docker compose up -d

# Verify
docker ps
```

Expected output:
````
oshadhi_backend    Up
oshadhi_frontend   Up
````

---

## Validation Checklist

- [ ] RDS instance reachable via `psql`
- [ ] SSL configured in Prisma pool
- [ ] `docker-compose.yml` has no `db` service or `postgres_data` volume
- [ ] `DATABASE_URL` set in EC2 environment
- [ ] Both containers show `Up`
- [ ] Auth, queries, and admin seed working

---

## Debugging Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| `P1010` auth error | Missing SSL config | Add `ssl: { rejectUnauthorized: false }` to pool |
| Migrations pass, runtime fails | Same SSL issue | Same fix |
| Backend restart loop | Bad `DATABASE_URL` or no SSL | Check env + SSL config |
| `psql` works, app doesn't | ORM vs raw connection difference | Check Prisma config specifically |

> **Key lesson:** A successful `psql` connection does **not** guarantee ORM runtime connectivity. Always verify SSL at the application layer separately.

---

## Next: v2.1.0 — S3 Storage Migration

- [ ] Upload documents to S3
- [ ] Store profile images in S3
- [ ] Remove local file storage
- [ ] Add IAM-based access control
- [ ] Prepare CloudFront integration