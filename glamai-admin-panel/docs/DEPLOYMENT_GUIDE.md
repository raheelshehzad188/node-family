# Deployment Guide

This guide covers deploying the GlamAI Admin Panel to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [SSL Configuration](#ssl-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### System Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum for application and data
- **OS**: Ubuntu 20.04+ or similar Linux distribution

### Software Requirements

- Docker 20.10+ and Docker Compose 1.29+
- Node.js 16+ (for manual deployment)
- MongoDB 4.4+
- Redis 6+
- Nginx (for reverse proxy)

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd glamai-admin-panel
```

### 2. Configure Environment Variables

Copy and edit the production environment file:

```bash
cp .env.production .env
nano .env
```

**Critical variables to update:**

```env
# Security - MUST CHANGE
JWT_SECRET=<generate-secure-random-string>
OTP_SECRET=<generate-secure-random-string>

# GlamAI API
GLAMAI_API_KEY=<your-production-api-key>

# Database
MONGODB_URI=mongodb://username:password@host:27017/glamai_admin

# Email
SMTP_USER=<your-email>
SMTP_PASS=<your-email-password>

# URLs
FRONTEND_URL=https://yourdomain.com
```

### 3. Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate OTP secret
openssl rand -base64 32
```

## Docker Deployment

### Quick Start

1. **Run the deployment script:**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

2. **Or manually with Docker Compose:**

```bash
docker-compose up -d
```

### Custom Docker Configuration

Edit `docker-compose.yml` for custom configurations:

```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    ports:
      - "5000:5000"
    volumes:
      - ./data/uploads:/app/uploads
      - ./data/logs:/app/logs
```

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update and rebuild
docker-compose down
git pull
docker-compose up -d --build
```

## Manual Deployment

### Backend Deployment

1. **Install dependencies:**

```bash
cd backend
npm ci --production
```

2. **Set up PM2:**

```bash
npm install -g pm2
pm2 start src/server.js --name glamai-backend
pm2 save
pm2 startup
```

3. **Configure PM2 ecosystem:**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'glamai-backend',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
```

### Frontend Deployment

1. **Build the application:**

```bash
cd frontend
npm ci
npm run build
```

2. **Serve with Nginx:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/glamai-admin/build;

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cloud Deployment

### AWS EC2

1. **Launch EC2 instance:**
   - Ubuntu 20.04 LTS
   - t3.medium or larger
   - Security groups: 80, 443, 22

2. **Install Docker:**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Deploy application:**

```bash
git clone <repository>
cd glamai-admin-panel
./scripts/deploy.sh production
```

### Google Cloud Platform

1. **Create VM instance:**

```bash
gcloud compute instances create glamai-admin \
  --machine-type=n1-standard-2 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB
```

2. **Deploy with Cloud Run (containerized):**

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/glamai-admin

# Deploy to Cloud Run
gcloud run deploy glamai-admin \
  --image gcr.io/PROJECT_ID/glamai-admin \
  --platform managed \
  --allow-unauthenticated
```

### Heroku

1. **Create Heroku app:**

```bash
heroku create glamai-admin
heroku addons:create mongolab:sandbox
heroku addons:create heroku-redis:hobby-dev
```

2. **Deploy:**

```bash
git push heroku main
```

## SSL Configuration

### Using Let's Encrypt

1. **Install Certbot:**

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain certificate:**

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Auto-renewal:**

```bash
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Maintenance

### Health Checks

1. **Backend health endpoint:**

```bash
curl https://yourdomain.com/api/health
```

2. **Create monitoring script:**

```bash
#!/bin/bash
# health-check.sh

BACKEND_URL="https://yourdomain.com/api/health"
FRONTEND_URL="https://yourdomain.com"

# Check backend
if ! curl -f $BACKEND_URL > /dev/null 2>&1; then
    echo "Backend is down!"
    # Send alert
fi

# Check frontend
if ! curl -f $FRONTEND_URL > /dev/null 2>&1; then
    echo "Frontend is down!"
    # Send alert
fi
```

### Backup Strategy

1. **Automated backups:**

```bash
# Add to crontab
0 2 * * * /path/to/glamai-admin-panel/scripts/backup.sh
```

2. **Backup to S3:**

```bash
# Install AWS CLI
aws configure

# Modify backup script to upload to S3
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/glamai/
```

### Log Management

1. **Log rotation:**

Create `/etc/logrotate.d/glamai`:

```
/var/www/glamai-admin/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

2. **Centralized logging (optional):**

```bash
# Install Elasticsearch, Logstash, Kibana (ELK Stack)
# Configure Logstash to parse application logs
```

### Performance Optimization

1. **Enable Redis caching:**

```javascript
// In backend configuration
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// Cache API responses
app.use('/api/glamai', cacheMiddleware);
```

2. **CDN for static assets:**

- Configure CloudFlare or AWS CloudFront
- Point to your domain
- Cache static assets

3. **Database optimization:**

```bash
# MongoDB performance tuning
mongo admin -u admin -p password --eval "
  db.runCommand({
    setParameter: 1,
    wiredTigerCacheSizeGB: 2
  })
"
```

### Security Hardening

1. **Firewall configuration:**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Fail2ban setup:**

```bash
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
```

3. **Security updates:**

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Troubleshooting

### Common Issues

1. **MongoDB connection fails:**
   - Check MongoDB service: `sudo systemctl status mongod`
   - Verify connection string
   - Check firewall rules

2. **Redis connection fails:**
   - Check Redis service: `sudo systemctl status redis`
   - Verify Redis password in config

3. **502 Bad Gateway:**
   - Check if backend is running
   - Verify Nginx proxy configuration
   - Check logs: `docker-compose logs backend`

4. **SSL certificate issues:**
   - Renew certificate: `sudo certbot renew`
   - Check certificate expiry: `sudo certbot certificates`

### Debug Mode

Enable debug logging:

```bash
# Docker
docker-compose exec backend npm run debug

# PM2
pm2 start ecosystem.config.js --env development
```

## Scaling

### Horizontal Scaling

1. **Load balancer setup:**

```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

2. **MongoDB replica set:**

```bash
# Initialize replica set
mongo --eval "rs.initiate()"
```

3. **Redis cluster:**

```bash
# Configure Redis cluster mode
redis-cli --cluster create node1:6379 node2:6379 node3:6379
```

## Rollback Procedure

In case of deployment issues:

1. **Docker rollback:**

```bash
# List previous images
docker images

# Rollback to previous version
docker-compose down
docker tag glamai-backend:previous glamai-backend:latest
docker-compose up -d
```

2. **Database rollback:**

```bash
# Restore from backup
mongorestore --drop --dir=/path/to/backup
```

Remember to test thoroughly in a staging environment before deploying to production!