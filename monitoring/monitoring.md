# Monitoring Stack

## Overview

The production environment uses a self-hosted monitoring stack built with **Prometheus**, **Grafana**, **Node Exporter**, and **cAdvisor**.

The objective is to provide complete visibility into the infrastructure, Docker containers, and backend application without relying on managed monitoring services.

---

## Monitoring Architecture

```
                    +----------------------+
                    |     Node Exporter    |
                    |  Host System Metrics |
                    +----------+-----------+
                               |
                               |
                    +----------v-----------+
                    |      Prometheus      |
                    | Metric Collection    |
                    +----------+-----------+
                               |
             +-----------------+-----------------+
             |                                   |
             |                                   |
+------------v----------+             +----------v-----------+
|      cAdvisor         |             | Backend (/metrics)   |
| Docker Metrics        |             | Prometheus Metrics   |
+-----------------------+             +----------------------+
                               |
                               |
                    +----------v-----------+
                    |      Grafana         |
                    | Dashboards & Alerts  |
                    +----------------------+
```

---

# Components

## Prometheus

Prometheus acts as the central metrics collector.

Responsibilities

- Scrapes application metrics
- Collects infrastructure metrics
- Stores time-series data
- Evaluates alert rules
- Serves metrics to Grafana

Scrape Targets

- Backend API
- Node Exporter
- cAdvisor

---

## Grafana

Grafana provides visualization for all collected metrics.

Features

- Infrastructure Dashboard
- Backend API Dashboard
- Docker Containers Dashboard
- Prometheus Health Dashboard
- Service Status Dashboard

Grafana persists dashboards using an attached AWS EBS volume.

---

## Node Exporter

Node Exporter exposes Linux host metrics.

Metrics include

- CPU Usage
- Memory Usage
- Disk Usage
- Filesystem
- Load Average
- Network Usage

---

## cAdvisor

cAdvisor exposes Docker container metrics.

Metrics include

- CPU Usage
- Memory Usage
- Network Traffic
- Container Filesystem Usage
- Running Containers

---

## Backend Metrics

The backend exposes Prometheus metrics through

```
/metrics
```

Example metrics

- HTTP Requests
- Response Status Codes
- Request Latency
- Request Rate
- Endpoint Metrics

---

# Dashboards

## 1. Backend API Dashboard

Application health monitoring.

Panels

- Total Requests
- Requests per Endpoint
- HTTP Status Codes
- Request Rate
- Average Response Time
- Error Rate
- Active Requests

---

## 2. Infrastructure Dashboard

Host resource monitoring.

Panels

- CPU Usage
- Memory Usage
- Disk Usage
- Filesystem Utilization
- Load Average
- Network Throughput

---

## 3. Docker Containers Dashboard

Container monitoring.

Panels

- Running Containers
- Container CPU Usage
- Container Memory Usage
- Network I/O
- Container Restart Count

---

## 4. Prometheus Health Dashboard

Monitoring stack health.

Panels

- Prometheus Status
- Target Availability
- Scrape Duration
- Scrape Success Rate
- TSDB Storage
- Active Targets

---

## 5. Service Status Dashboard

Overall system availability.

Panels

- Backend Status
- Prometheus Status
- Grafana Status
- Node Exporter Status
- cAdvisor Status

---

# Alerting

Prometheus Alert Rules monitor the infrastructure.

Current alerts

- High CPU Usage
- High Memory Usage
- Low Disk Space
- Target Down
- Backend Unreachable

---

# Persistent Storage

Grafana data is stored on a dedicated AWS EBS volume.

Persisted data

- Dashboards
- Users
- Preferences
- Data Sources
- Alert Configurations

This ensures monitoring configuration survives

- Container recreation
- Docker updates
- EC2 reboot
- Deployment cycles

---

# Provisioning

Grafana is provisioned automatically.

Provisioned Resources

- Prometheus Datasource
- Dashboard Providers
- Dashboard JSON Files

Directory Structure

```
monitoring/
│
├── grafana/
│   ├── dashboards/
│   ├── provisioning/
│   │   ├── dashboards/
│   │   └── datasources/
│
├── prometheus/
│   ├── prometheus.yml
│   └── alert.rules.yml
```

---

# Monitoring Workflow

```
Application

        │

        ▼

/metrics endpoint

        │

        ▼

Prometheus

        │

        ▼

Time-Series Database

        │

        ▼

Grafana

        │

        ▼

Dashboards & Alerts
```

---

# Technologies

- Prometheus
- Grafana
- Node Exporter
- cAdvisor
- Docker Compose
- AWS EC2
- AWS EBS

---

# Operational Notes

- Monitoring stack runs as Docker containers.
- Dashboards persist using AWS EBS.
- Prometheus continuously scrapes configured targets.
- Grafana dashboards are provisioned from JSON exports.
- Dashboard JSON files are version-controlled for reproducible deployments.

---

# Future Improvements

- CloudWatch integration
- SNS Alert Notifications
- Terraform provisioning
- Remote Prometheus storage
- Centralized log aggregation (Loki)
- Distributed tracing with OpenTelemetry