# Docco360

Docco360 is a real-time doctor–patient consultation platform built as an engineering-first cloud project that demonstrates how a local application evolves into a production-style AWS deployment.

Rather than stopping at a working application, the focus of this project is infrastructure evolution, deployment maturity, architecture refactoring, and cloud engineering practices.

The project progressively evolved through multiple deployment stages:

**Local Development → Docker → EC2 Deployment → Amazon RDS Integration → CI/CD Automation → Cloud Architecture Evolution**

---

# Why Docco360?

Most portfolio projects stop after "it works on localhost."

Docco360 focuses on what happens after that:

* Packaging applications for reproducible deployment
* Moving from monolithic hosting to decoupled architecture
* Introducing managed cloud services
* Improving deployment workflows
* Applying DevOps principles progressively

The objective was not building another consultation app.

The objective was understanding how systems mature from development environments into cloud-hosted deployments.

---

# Features

## Application Layer

* Real-time doctor-patient consultation workflow
* WebRTC-based communication
* Full-stack application architecture
* Secure session handling
* Role-based access control
* Appointment management workflow

---

## DevOps & Cloud Layer

* Dockerized deployment workflow
* Amazon EC2 hosted infrastructure
* Amazon RDS PostgreSQL integration
* SSL-secured database connectivity
* Decoupled application and database architecture
* GitHub Actions CI/CD pipelines
* Docker Hub image registry
* Environment-based deployment configuration

---

# Architecture

Current deployment follows a decoupled cloud architecture:

- Frontend hosted through S3 + CloudFront
- Backend containerized and deployed on EC2
- Backend isolated in private subnet
- Traffic routed through Application Load Balancer
- Persistent data handled through Amazon RDS

```text
                         Internet
                             |
                         HTTPS
                             |
                     +---------------+
                     | CloudFront    |
                     +-------+-------+
                             |
                             |
                     +---------------+
                     | S3 Frontend   |
                     +---------------+

Browser -------------------------> API Requests
                                   |
                                   v

+-----------------------------------------------------------+
|                         AWS VPC                           |
|                                                           |
| Public Subnet                                             |
|                                                           |
|   +---------------------------------------------+         |
|   | Application Load Balancer                   |         |
|   +----------------+----------------------------+         |
|                    |                                      |
|                    |                                      |
|                    v                                      |
|                                                           |
| Private Subnet                                            |
|                                                           |
|   +---------------------------------------------+         |
|   | EC2 Containerized Backend                   |         |
|   +----------------+----------------------------+         |
|                    |                                      |
|                    v                                      |
|                                                           |
|   +---------------------------------------------+         |
|   | Amazon RDS                                  |         |
|   +---------------------------------------------+         |
|                                                           |
+-----------------------------------------------------------+
```

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite

---

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM

---

## Database

* PostgreSQL
* Amazon RDS

---

## Real-Time Communication

* WebRTC
* Agora

---

## Containerization

* Docker
* Docker Compose

---

## Cloud Infrastructure

* Amazon EC2
* Amazon RDS
* Security Groups

---

## CI/CD

* GitHub Actions
* Docker Hub

---

## Supporting Services

* NGINX
* Prisma
* PostgreSQL
* Git

---

# Deployment Evolution

## V1 — Initial Internet Deployment

Initial application deployment focused on taking the project from local development to public accessibility.

Implemented:

* Local development workflow
* Docker containerization
* Docker Hub image publishing
* Amazon EC2 deployment

---

## V2 — Data Layer Modernization

Infrastructure improvements focused on separating compute and persistent storage.

Implemented:

* Migration from containerized PostgreSQL to Amazon RDS PostgreSQL
* SSL-secured database connectivity
* Separation of application and database layers
* Reduced infrastructure coupling
* Improved persistence and operational reliability


## V3 — Cloud Architecture Refactor

Infrastructure improvements focused on network isolation, security hardening, and service separation.

Implemented:

* Amazon S3 integration for object and file storage
* CloudFront CDN integration for content delivery
* Custom VPC architecture
* Public and private subnet segregation
* Internet Gateway (IGW) configuration
* NAT Gateway deployment
* Route table configuration
* Bastion Host deployment
* Backend migration to private EC2
* RDS migration to private subnets
* Security Group redesign and least-privilege access controls
* Application Load Balancer (ALB) integration
* Target Group configuration
* End-to-end HTTPS/TLS implementation

---

## V4 — Observability & Operations Platform

Infrastructure improvements focused on monitoring, visibility, operational readiness, and production observability.

Implemented:

* Amazon CloudWatch integration
* Centralized application logging
* Infrastructure metrics collection
* CloudWatch alarms and monitoring
* Prometheus deployment
* Grafana deployment
* EC2 monitoring dashboards
* Container monitoring dashboards
* Database monitoring dashboards
* Application health monitoring
* Performance and resource utilization tracking
* Alerting and incident visibility workflows
* Operational observability layer for infrastructure and services


Result:

```text
Before

Frontend Container
Backend Container
PostgreSQL Container

After

Frontend Container
Backend Container
Amazon RDS PostgreSQL
```

---

# Deployment Workflow
```
Local Development
        |
        v

Docker Build
        |
        v

Docker Hub
        |
        v

GitHub Actions CI/CD
        |
        v

Amazon EC2 (Backend)
        |
        +----------------------+
        |                      |
        v                      v

Amazon RDS            Amazon S3
PostgreSQL            Object Storage
        |                      |
        +----------+-----------+
                   |
                   v

CloudFront CDN
                   |
                   v

Application Load Balancer
                   |
                   v

Internet Users
```
---

# Engineering Problems Solved

## Runtime Drift

Applications behaved differently inside Docker compared to local development environments.

Solved through:

* Environment standardization
* Container debugging
* Consistent deployment workflows

---

## Container Reachability

Container availability did not automatically guarantee public accessibility.

Required investigation of:

* Security groups
* Exposed ports
* Inbound rules
* Docker networking
* EC2 networking

---

## Database Migration

Migrated from a self-hosted PostgreSQL container to Amazon RDS PostgreSQL without changing application business logic.

Required:

* Infrastructure refactoring
* Prisma reconfiguration
* SSL database connectivity
* Environment migration
* Deployment updates

---

## Service Decoupling

Separated persistent data storage from application compute resources.

Benefits:

* Independent lifecycle management
* Improved maintainability
* Better production readiness
* Reduced operational risk

---

# Project Scope

This project demonstrates:

✓ AWS deployment experience

✓ Docker workflows

✓ CI/CD implementation

✓ PostgreSQL administration

✓ Amazon RDS integration

✓ Infrastructure migration

✓ Cloud engineering practices

✓ Deployment automation

✓ Production-oriented architecture thinking

---

# Engineering Highlights

* Successfully migrated application data from a containerized PostgreSQL instance to Amazon RDS PostgreSQL.
* Implemented SSL-secured connectivity between application services and managed database infrastructure.
* Reduced infrastructure coupling by separating compute and persistent storage layers.
* Built automated deployment workflows using Docker, Docker Hub, GitHub Actions, and AWS services.
* Applied cloud architecture principles through progressive infrastructure evolution and service separation.

Docco360 serves as both an application platform and an ongoing cloud engineering project focused on practical infrastructure modernization.

---

# Contributors

## Sri Harsha

**Cloud & DevOps Engineer**

Responsibilities:

* AWS Infrastructure
* Docker Deployment Architecture
* CI/CD Pipelines
* Cloud Operations
* System Architecture
* Amazon RDS Migration
* Infrastructure Evolution

GitHub: https://github.com/sriharshareddy6464

---

## Shashi Varun Reddy

**Backend & DevOps Engineer**

Responsibilities:

* Backend Development
* API Architecture
* Database Integration
* Service Implementation
* Business Logic Development

GitHub: https://github.com/Shashivarunreddy

---

## Vivek Varma

**Frontend & UI Engineer**

Responsibilities:

* Frontend Development
* User Interface Engineering
* User Experience Design
* React Implementation

GitHub: https://github.com/vivekvarma-01

---

# Project Philosophy

Building software is only the beginning.

Making software deployable, maintainable, observable, and production-ready requires a completely different set of engineering decisions.

Docco360 was built to explore that transition through practical cloud infrastructure, deployment workflows, and system architecture evolution.
