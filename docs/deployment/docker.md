# Docker Deployment

Deploy the boilerplate using Docker containers.

## Overview

This guide covers deploying the boilerplate with Docker, including multi-container setups with PostgreSQL and optional services.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Docker Configuration

### Base Dockerfile

```dockerfile
# apps/backoffice/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages packages/
COPY apps/backoffice/package.json ./apps/backoffice/

RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm --filter backoffice build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/backoffice/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/backoffice/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Standalone Output

Configure Next.js for standalone output:

```javascript
// apps/backoffice/next.config.js
module.exports = {
  output: "standalone",
  // ... other config
};
```

## Docker Compose

### Full Stack Setup

```yaml
# docker-compose.yml
version: "3.8"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: boilerplate-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: boilerplate
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backoffice Application
  backoffice:
    build:
      context: .
      dockerfile: apps/backoffice/Dockerfile
    container_name: boilerplate-backoffice
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/boilerplate"
      NEXTAUTH_URL: "http://localhost:3000"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
      S3_ACCESS_KEY_ID: "${S3_ACCESS_KEY_ID}"
      S3_SECRET_ACCESS_KEY: "${S3_SECRET_ACCESS_KEY}"
      S3_BUCKET_NAME: "${S3_BUCKET_NAME}"
      S3_REGION: "${S3_REGION}"
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  # Landing Page (optional)
  landing:
    build:
      context: .
      dockerfile: apps/landing/Dockerfile
    container_name: boilerplate-landing
    environment:
      NEXT_PUBLIC_APP_URL: "http://localhost:3001"
    ports:
      - "3001:3001"
    restart: unless-stopped

  # Nginx Reverse Proxy (optional)
  nginx:
    image: nginx:alpine
    container_name: boilerplate-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backoffice
      - landing
    restart: unless-stopped

volumes:
  postgres_data:
```

### Environment File

```bash
# .env
NEXTAUTH_SECRET=your-secret-key-here
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket
S3_REGION=us-east-1
```

## Deployment Steps

### 1. Build Images

```bash
docker-compose build
```

### 2. Run Migrations

```bash
docker-compose run --rm backoffice pnpm db:push
```

### 3. Seed Database (Optional)

```bash
docker-compose run --rm backoffice pnpm db:seed
```

### 4. Start Services

```bash
docker-compose up -d
```

### 5. Check Logs

```bash
docker-compose logs -f backoffice
```

## Production Deployment

### With Nginx

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backoffice {
        server backoffice:3000;
    }

    upstream landing {
        server landing:3001;
    }

    server {
        listen 80;
        server_name yourdomain.com;

        # Backoffice
        location / {
            proxy_pass http://backoffice;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Landing (subdomain)
        location / {
            proxy_pass http://landing;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### With SSL

Use Certbot for free SSL certificates:

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Multi-Stage Build

Optimize build with caching:

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

FROM base AS deps
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY packages packages/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter backoffice build

FROM base AS production
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/backoffice/public ./public
COPY --from=build --chown=nextjs:nodejs /app/apps/backoffice/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/backoffice/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

## Container Orchestration

### Kubernetes (Optional)

For larger deployments, use Kubernetes:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backoffice
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backoffice
  template:
    metadata:
      labels:
        app: backoffice
    spec:
      containers:
      - name: backoffice
        image: your-registry/backoffice:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
```

## Health Checks

Configure health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if(r.statusCode !== 200) throw new Error(r.statusCode)})"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backoffice

# Enter container
docker-compose exec backoffice sh
```

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -d boilerplate
```

### Build Issues

```bash
# Clear cache and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## See Also

- [Vercel Deployment](/docs/deployment/vercel) - Vercel deployment
- [Custom Server](/docs/deployment/custom-server) - VPS deployment
- [Configuration](/docs/getting-started/configuration) - Environment variables
