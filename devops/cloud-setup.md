# 🚀 AWS EC2 Deployment Setup (Image-Based Containerization)

## Overview
This guide documents the production deployment of the Doctor-Patient App using AWS EC2 with Docker.  
The system uses **image-based containerization**, where pre-built images are pulled from DockerHub and executed on EC2.

---

## Architecture

```
Local Development
    ↓
Build Docker Images
    ↓
Push to DockerHub
    ↓
AWS EC2 Instance
    ↓
docker compose pull + up
    ↓
Running Containers (Frontend + Backend + DB)
````

---

## Prerequisites

* AWS Account
* DockerHub account
* SSH key pair for EC2
* Backend & frontend images available on DockerHub

---

## 1. Launch EC2 Instance

* Instance Name: `doctoroncall`
* OS: Ubuntu (22.04 or compatible)
* Storage: 32 GB (gp3)
* Instance Type: t3.medium (recommended)

### Security Group (Inbound Rules)

| Type       | Port | Source    |
| ---------- | ---- | --------- |
| SSH        | 22   | Your IP   |
| HTTP       | 80   | 0.0.0.0/0 |
| Custom TCP | 5000 | 0.0.0.0/0 |
| HTTPS      | 443  | 0.0.0.0/0 |
---

## 2. Allocate Elastic IP

* Go to **EC2 → Elastic IPs**
* Allocate new IP
* Associate with instance

👉 This ensures a **static public IP** (no change on restart)

---

## 3. Connect to EC2

```bash
ssh -i <key.pem> ubuntu@<ELASTIC_IP>
```

---

## 4. Install Docker (Official Setup)

```bash
sudo apt update
sudo apt install ca-certificates curl gnupg -y

sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu jammy stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

### Enable Docker

```bash
sudo systemctl start docker
sudo systemctl enable docker

sudo usermod -aG docker ubuntu
newgrp docker
```

### Verify installation

```bash
docker --version
docker compose version
```

---

## 5. Project Setup on EC2

```bash
mkdir doctoroncall && cd doctoroncall
```

---

## 6. Create Production Files

### docker-compose.yaml

copy from ./ec2-setup/docker-compose.yaml

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: oshadhi_db
    restart: always
    env_file:
      - ./.env
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

  backend:
    image: <dockerhub-username>/doc-backend:latest
    container_name: oshadhi_backend
    restart: always
    env_file:
      - ./.env
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - "5000:5000"

  frontend:
    image: <dockerhub-username>/doc-frontend:latest
    container_name: oshadhi_frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  postgres_data:
```

---

### .env (DO NOT COMMIT) 

```example env
POSTGRES_DB=your_db
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password

JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

APP_ID=your_agora_app_id
APP_CERTIFICATE=your_agora_certificate

FRONTEND_URL=http://<ELASTIC_IP>
```
check .env.example files among whole repo 
---

## 7. Deploy Containers

```bash
docker compose pull
docker compose up -d
```

---

## 8. Verify Deployment

```bash
docker ps
```

Expected:

* frontend running on port 80
* backend running on port 5000
* db healthy

---

## 9. Access Application

```text
http://<ELASTIC_IP>
```

---

## 10. Common Issues

### Site not reachable

* Check Security Group (port 80 open) 
* Confirm Elastic IP

### Docker errors

```bash
sudo systemctl restart docker
```

### Container crash

```bash
docker logs <container_name>
```

---

## 11. Important Notes

* `.env` must NEVER be committed
* EC2 only runs containers (no source code required)
* Uses DockerHub images → ensures consistent deployment
* Elastic IP required for stable access

---

## 12. Deployment Flow Summary

```text
Local → Build image → Push image → EC2 Pull image → Run containers 
```

---

## Next Steps

* CI/CD automation using GitHub Actions
* Reverse proxy + HTTPS (Nginx + Certbot)
* Domain integration

```
```
