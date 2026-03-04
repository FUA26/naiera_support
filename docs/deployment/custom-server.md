# Custom VPS Deployment

Deploy the boilerplate to a custom VPS or dedicated server.

## Overview

This guide covers deploying to a VPS (DigitalOcean, Linode, AWS EC2, etc.) with Node.js, PostgreSQL, and Nginx.

## Prerequisites

- VPS with Ubuntu 20.04+ or similar
- Domain name pointing to your server
- SSH access to the server

## Server Setup

### 1. Connect to Server

```bash
ssh root@your-server-ip
```

### 2. Update System

```bash
apt update && apt upgrade -y
```

### 3. Install Dependencies

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

### 4. Create Application User

```bash
# Create user
useradd -m -s /bin/bash appuser

# Set up SSH key for appuser
mkdir -p /home/appuser/.ssh
cp ~/.ssh/authorized_keys /home/appuser/.ssh/
chown -R appuser:appuser /home/appuser/.ssh
chmod 700 /home/appuser/.ssh
chmod 600 /home/appoffice/.ssh/authorized_keys
```

## Database Setup

### 1. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE yourapp;
CREATE USER yourapp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE yourapp TO yourapp_user;
\q
```

### 2. Enable Remote Access (Optional)

```bash
# Edit postgresql.conf
nano /etc/postgresql/14/main/postgresql.conf

# Add:
listen_addresses = 'localhost'

# Edit pg_hba.conf
nano /etc/postgresql/14/main/pg_hba.conf

# Add:
host    yourapp    yourapp_user    127.0.0.1/32    md5

# Restart PostgreSQL
systemctl restart postgresql
```

## Application Deployment

### 1. Clone Repository

```bash
# Switch to appuser
su - appuser

# Clone repository
git clone https://github.com/yourusername/yourrepo.git app
cd app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Build Application

```bash
pnpm build
```

### 4. Configure Environment

```bash
# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://yourapp_user:secure_password@localhost:5432/yourapp"
AUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket"
S3_REGION="us-east-1"
NODE_ENV="production"
EOF
```

### 5. Run Migrations

```bash
pnpm --filter backoffice db:push
pnpm --filter backoffice db:seed
```

## Process Management with PM2

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create PM2 Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "backoffice",
      script: "apps/backoffice/node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/home/appuser/app",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/appuser/.pm2/logs/backoffice-error.log",
      out_file: "/home/appuser/.pm2/logs/backoffice-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "landing",
      script: "apps/landing/node_modules/.bin/next",
      args: "start -p 3001",
      cwd: "/home/appuser/app",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/home/appuser/.pm2/logs/landing-error.log",
      out_file: "/home/appuser/.pm2/logs/landing-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
```

### 3. Start Applications

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx Configuration

### 1. Create Backoffice Config

```nginx
# /etc/nginx/sites-available/backoffice
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Create Landing Config

```nginx
# /etc/nginx/sites-available/landing
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable Sites

```bash
ln -s /etc/nginx/sites-available/backoffice /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/landing /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## SSL with Let's Encrypt

### 1. Obtain Certificates

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot --nginx -d app.yourdomain.com
```

### 2. Auto-Renewal

Certbot sets up auto-renewal by default. Verify:

```bash
certbot renew --dry-run
```

## Automatic Deployment

### 1. Create Deploy Script

```bash
#!/bin/bash
# deploy.sh

cd /home/appuser/app

# Pull latest changes
git fetch origin main
git reset --hard origin/main

# Install dependencies
pnpm install

# Build
pnpm build

# Run migrations
pnpm --filter backoffice db:push

# Restart PM2
pm2 restart all
```

### 2. Set Up Git Hook

On GitHub/GitLab, configure webhook to trigger deployment.

### 3. Use CI/CD (Optional)

Create GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: appuser
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /home/appuser/app
            ./deploy.sh
```

## Monitoring

### 1. PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor
pm2 monit
```

### 2. Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### 3. Disk Space

```bash
df -h
du -sh /home/appuser/app
```

## Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/appuser/backups"
mkdir -p $BACKUP_DIR

pg_dump -U yourapp_user yourapp | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

### 2. Automated Backups

Add to crontab:

```bash
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/appuser/backup-db.sh
```

## Security Hardening

### 1. Firewall

```bash
# Install ufw
apt install -y ufw

# Configure
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### 2. Fail2Ban

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 3. SSH Security

```bash
# Disable password login
nano /etc/ssh/sshd_config

# Change:
PasswordAuthentication no

# Restart SSH
systemctl restart sshd
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs backoffice

# Check port usage
netstat -tlnp | grep 3000
```

### Nginx 502 Error

```bash
# Verify app is running
pm2 status

# Check upstream configuration
nginx -t
```

### Database Connection Failed

```bash
# Verify PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U yourapp_user -d yourapp -h localhost
```

## See Also

- [Docker Deployment](/docs/deployment/docker) - Docker deployment
- [Vercel Deployment](/docs/deployment/vercel) - Vercel deployment
- [Configuration](/docs/getting-started/configuration) - Environment variables
