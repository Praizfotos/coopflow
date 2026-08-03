# Deployment Guide

## Prerequisites

- Docker 24+
- Docker Compose 2.20+
- Node.js 20+
- PostgreSQL 16+
- Rust 1.75+ (for contract builds)

## Quick Deployment

### 1. Clone and Configure

```bash
git clone https://github.com/coopflow/coopflow.git
cd coopflow
cp .env.example .env
# Edit .env with your configuration
```

### 2. Deploy with Docker Compose

```bash
# Development
docker compose up -d

# Production
docker compose -f docker/docker-compose.prod.yml up -d
```

### 3. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | 3001 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | Database username | coopflow |
| `DB_PASSWORD` | Database password | coopflow_secret |
| `DB_NAME` | Database name | coopflow_db |
| `JWT_SECRET` | JWT signing secret | (required) |
| `STELLAR_HORIZON_URL` | Stellar Horizon URL | https://horizon-testnet.stellar.org |
| `STELLAR_NETWORK_PASSPHRASE` | Network passphrase | Test SDF Network ; September 2015 |

## Production Deployment

### Using Docker Compose

```bash
# Build production images
docker compose -f docker/docker-compose.prod.yml build

# Start production stack
docker compose -f docker/docker-compose.prod.yml up -d
```

### Using Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
```

### Using AWS ECS

```bash
# Build and push images
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t coopflow-backend -f docker/Dockerfile .
docker tag coopflow-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/coopflow-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/coopflow-backend:latest

# Deploy via ECS
aws ecs update-service --cluster coopflow --service coopflow-backend --force-new-deployment
```

## SSL/TLS Configuration

For production, configure SSL via your reverse proxy (nginx, Traefik, etc.):

```nginx
server {
    listen 443 ssl;
    server_name coopflow.example.com;

    ssl_certificate /etc/ssl/certs/coopflow.crt;
    ssl_certificate_key /etc/ssl/private/coopflow.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring

- Health check endpoint: `GET /api/v1/health`
- Prometheus metrics available at `/metrics`
- Log aggregation configured for production

## Backup

```bash
# PostgreSQL backup
pg_dump -U coopflow coopflow_db > coopflow_backup_$(date +%Y%m%d).sql

# Redis backup
redis-cli BGSAVE
```