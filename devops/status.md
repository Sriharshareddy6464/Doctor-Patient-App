# Project Status

## Major Events

### Database Migration

* Migrated database from local PostgreSQL container to AWS RDS.
* Backend now uses managed PostgreSQL instead of a containerized database.

---

### Deployment Architecture Improvements

* Investigated production deployment failures with SHA-tagged images.
* Identified frontend and backend deployment coupling.
* Implemented independent deployment workflows.
* Backend and frontend deployments no longer depend on each other.
* Validated SHA-based deployments in production.

---

### Frontend Migration

* Migrated frontend hosting from EC2 container to Amazon S3.
* Introduced CloudFront as CDN layer for global content delivery.
* Removed frontend dependency from DockerHub and EC2 deployment.

---

### HTTPS and Domain Configuration

* Configured AWS Certificate Manager (ACM).
* Enabled HTTPS for frontend.
* Configured:

```text
docco.arakutravels.com
        ↓
CloudFront
```

---

### Backend Routing Architecture

* Introduced Application Load Balancer (ALB).
* Created dedicated API endpoint:

```text
api.arakutravels.com
        ↓
ALB
        ↓
EC2 Backend Container
```

* Configured target groups and security groups.
* Restricted backend access through ALB.

---

### CI/CD Improvements

#### Backend

```text
GitHub Actions
        ↓
Docker Build
        ↓
DockerHub
        ↓
EC2 Deployment
```

#### Frontend

```text
GitHub Actions
        ↓
Build Static Assets
        ↓
S3 Upload
        ↓
CloudFront Cache Invalidation
```

---

### Production Security

* HTTPS enabled using ACM certificates.
* DNS configured through GoDaddy.
* Backend no longer exposed directly through EC2 public IP.
* Traffic routed through ALB.

---

### WebRTC Validation

* Video and audio communication verified successfully.
* HTTPS requirement satisfied.
* Agora integration operational.

---

### Infrastructure Cleanup

* Removed frontend container from production.
* Simplified Docker Compose to backend-focused architecture.
* Production stack prepared for observability and monitoring.

---

# Current Architecture

```text
Users
    ↓
GoDaddy DNS
    ↓
CloudFront
    ↓
S3 Frontend

Frontend
    ↓
api.arakutravels.com
    ↓
Application Load Balancer
    ↓
Backend Container (EC2)
    ↓
AWS RDS PostgreSQL
```

---

# Current CI/CD Architecture

## Backend

```text
Push
    ↓
Backend CI
    ↓
DockerHub
    ↓
Backend Deployment
    ↓
EC2
```

## Frontend

```text
Push
    ↓
Frontend CI/CD
    ↓
Build
    ↓
S3 Sync
    ↓
CloudFront Invalidation
```

---

# Current Production Components

* CloudFront
* Amazon S3
* Application Load Balancer
* EC2
* Docker
* AWS RDS PostgreSQL
* GitHub Actions
* DockerHub
* ACM Certificates
* GoDaddy DNS
* WebRTC (Agora)

---

# Current Status

## Completed

* Production deployment
* Independent deployments
* HTTPS migration
* Frontend cloud migration
* API routing architecture
* WebRTC validation
* Infrastructure cleanup

## In Progress

* Documentation updates

## Next Stage

Observability and Monitoring

Planned components:

* Prometheus
* Grafana
* Node Exporter
* cAdvisor

Future expansion:

* Alertmanager
* Loki
* Promtail
* OpenTelemetry
* Jaeger
