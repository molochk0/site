# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Restaurant Site to a production environment with GitHub CI/CD integration and real database connectivity.

## Prerequisites

### Server Requirements

- **Operating System**: Ubuntu 20.04 LTS or later
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 50GB SSD with backup capability
- **Network**: Static IP address with domain pointing to server

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Nginx (handled via Docker)
- SSL/TLS certificates
- Git

## 1. Server Setup

### 1.1 Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git ufw fail2ban htop

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Install fail2ban for SSH protection
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 1.2 Docker Installation

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 1.3 Create Application Directory

```bash
# Create application directory
sudo mkdir -p /opt/restaurant-site
sudo chown $USER:$USER /opt/restaurant-site
cd /opt/restaurant-site

# Clone repository (or setup for deployment)
git clone https://github.com/YOUR_USERNAME/restaurant-site.git .
```

## 2. SSL Certificate Setup

### 2.1 Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot

# Stop any running web servers
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Create SSL directory for Docker
sudo mkdir -p /opt/restaurant-site/docker/nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/restaurant-site/docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/restaurant-site/docker/nginx/ssl/private.key

# Generate DH parameters
sudo openssl dhparam -out /opt/restaurant-site/docker/nginx/ssl/dhparam.pem 2048

# Set permissions
sudo chown -R $USER:$USER /opt/restaurant-site/docker/nginx/ssl
chmod 600 /opt/restaurant-site/docker/nginx/ssl/private.key
```

### 2.2 Certificate Auto-Renewal

```bash
# Create renewal script
cat > /opt/restaurant-site/scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet --pre-hook "docker-compose -f /opt/restaurant-site/docker-compose.prod.yml stop nginx" --post-hook "docker-compose -f /opt/restaurant-site/docker-compose.prod.yml start nginx"

# Copy renewed certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/restaurant-site/docker/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/restaurant-site/docker/nginx/ssl/private.key
EOF

chmod +x /opt/restaurant-site/scripts/renew-ssl.sh

# Add to crontab for automatic renewal
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/restaurant-site/scripts/renew-ssl.sh") | crontab -
```

## 3. Environment Configuration

### 3.1 Create Production Environment File

```bash
cd /opt/restaurant-site

# Copy the template
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

### 3.2 Required Environment Variables

Update `.env.production` with your actual production values:

```bash
# Database
DATABASE_URL="postgresql://restaurant_prod_user:YOUR_STRONG_DB_PASSWORD@postgres:5432/restaurant_prod?sslmode=require"
POSTGRES_USER=restaurant_prod_user
POSTGRES_PASSWORD=YOUR_STRONG_DB_PASSWORD
POSTGRES_DB=restaurant_prod

# Application
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=YOUR_STRONG_32_CHAR_SECRET

# Redis
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3.3 Secure Environment File

```bash
# Set secure permissions
chmod 600 .env.production
```

## 4. GitHub Repository Setup

### 4.1 Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DEPLOY_HOST` | Production server IP/domain | `your-domain.com` |
| `DEPLOY_USER` | SSH username for deployment | `deploy` |
| `DEPLOY_SSH_KEY` | Private SSH key for server access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `DATABASE_URL` | Production database connection string | `postgresql://user:pass@postgres:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth secret key | `random-32-char-string` |
| `NEXTAUTH_URL` | Production URL | `https://your-domain.com` |
| `POSTGRES_PASSWORD` | Database password | `strong-database-password` |
| `REDIS_PASSWORD` | Redis password | `strong-redis-password` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

### 4.2 SSH Key Setup

```bash
# On your local machine, generate SSH key for deployment
ssh-keygen -t rsa -b 4096 -f ~/.ssh/restaurant_deploy_key

# Copy public key to production server
ssh-copy-id -i ~/.ssh/restaurant_deploy_key.pub user@your-domain.com

# Add private key to GitHub secrets as DEPLOY_SSH_KEY
cat ~/.ssh/restaurant_deploy_key
```

### 4.3 Create Deploy User (Recommended)

```bash
# On production server, create dedicated deploy user
sudo adduser deploy
sudo usermod -aG docker deploy

# Set up SSH access for deploy user
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# Give deploy user access to application directory
sudo chown -R deploy:deploy /opt/restaurant-site
```

## 5. Database Setup

### 5.1 Initial Database Deployment

```bash
cd /opt/restaurant-site

# Start only the database first
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
sleep 30

# Run initial migration and seed
docker run --rm --env-file .env.production \
  --network restaurant_restaurant-network \
  -v $(pwd)/prisma:/app/prisma \
  -v $(pwd)/data:/app/data \
  ghcr.io/YOUR_USERNAME/restaurant-site:latest \
  sh -c "npx prisma migrate deploy && npm run db:seed"
```

### 5.2 Database Backup Setup

```bash
# Create backup directories
mkdir -p /opt/restaurant-site/backups/{daily,weekly,monthly,manual}

# Make backup script executable
chmod +x /opt/restaurant-site/scripts/backup-database.sh

# Test backup script
./scripts/backup-database.sh manual

# Setup automated backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/restaurant-site/scripts/backup-database.sh daily") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/restaurant-site/scripts/backup-database.sh weekly") | crontab -
(crontab -l 2>/dev/null; echo "0 4 1 * * /opt/restaurant-site/scripts/backup-database.sh monthly") | crontab -
```

## 6. Initial Deployment

### 6.1 Manual Deployment (First Time)

```bash
cd /opt/restaurant-site

# Pull latest image
docker pull ghcr.io/YOUR_USERNAME/restaurant-site:latest

# Update docker-compose with the image
sed -i "s|image:.*|image: ghcr.io/YOUR_USERNAME/restaurant-site:latest|" docker-compose.prod.yml

# Deploy all services
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
sleep 30
curl -f https://your-domain.com/api/health
```

### 6.2 Verify Services

```bash
# Check running containers
docker ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f --tail=50

# Test application endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/promotions
curl https://your-domain.com/api/events
```

## 7. Monitoring and Maintenance

### 7.1 Log Management

```bash
# Setup log rotation
sudo tee /etc/logrotate.d/restaurant-site << EOF
/opt/restaurant-site/docker/nginx/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        docker kill -s USR1 restaurant-nginx 2>/dev/null || true
    endscript
}
EOF
```

### 7.2 Health Monitoring

Create a monitoring script:

```bash
cat > /opt/restaurant-site/scripts/health-check.sh << 'EOF'
#!/bin/bash

DOMAIN="https://your-domain.com"
SLACK_WEBHOOK="your-slack-webhook-url"

# Check health endpoint
if ! curl -f "$DOMAIN/api/health" > /dev/null 2>&1; then
    echo "Health check failed at $(date)"
    # Send alert (uncomment if using Slack)
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"🚨 Restaurant site health check failed: $DOMAIN\"}" \
    #   "$SLACK_WEBHOOK"
    exit 1
fi

echo "Health check passed at $(date)"
EOF

chmod +x /opt/restaurant-site/scripts/health-check.sh

# Add to crontab for regular checks
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/restaurant-site/scripts/health-check.sh") | crontab -
```

## 8. Troubleshooting

### 8.1 Common Issues

**Database Connection Issues:**
```bash
# Check database container
docker logs restaurant-postgres-prod

# Test database connection
docker exec restaurant-postgres-prod psql -U postgres -d restaurant_prod -c "SELECT 1;"
```

**SSL Certificate Issues:**
```bash
# Check certificate validity
openssl x509 -in /opt/restaurant-site/docker/nginx/ssl/cert.pem -text -noout

# Test SSL
curl -I https://your-domain.com
```

**Application Issues:**
```bash
# Check application logs
docker logs restaurant-app-prod

# Check nginx logs
docker logs restaurant-nginx
```

### 8.2 Recovery Procedures

**Database Recovery:**
```bash
# List available backups
ls -la /opt/restaurant-site/backups/*/

# Restore from backup
./scripts/backup-database.sh daily restore /path/to/backup.sql.gz
```

**Rollback Deployment:**
```bash
# Find previous image
docker images | grep restaurant-site

# Update docker-compose with previous image
sed -i "s|image:.*|image: previous-image-tag|" docker-compose.prod.yml

# Redeploy
docker-compose -f docker-compose.prod.yml up -d
```

## 9. Security Checklist

- [ ] SSL certificate properly configured and auto-renewing
- [ ] Firewall configured to allow only necessary ports
- [ ] SSH key-based authentication enabled
- [ ] Strong passwords for all database accounts
- [ ] Environment variables properly secured
- [ ] Regular security updates scheduled
- [ ] Database backups automated and tested
- [ ] Log monitoring configured
- [ ] Rate limiting enabled in Nginx
- [ ] Security headers configured

## 10. Performance Optimization

### 10.1 Database Optimization

```sql
-- Connect to database and run optimization queries
-- Analyze table statistics
ANALYZE;

-- Update PostgreSQL configuration if needed
-- Edit /var/lib/postgresql/data/postgresql.conf in container
```

### 10.2 Application Monitoring

```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h
du -sh /opt/restaurant-site/*

# Monitor application performance
docker exec restaurant-app-prod npm run performance:check
```

## Support and Maintenance

For ongoing support and maintenance:

1. Monitor application logs regularly
2. Keep Docker images updated
3. Apply security patches promptly
4. Test backup and recovery procedures monthly
5. Monitor SSL certificate expiration
6. Review and update security configurations quarterly

## Conclusion

Your Restaurant Site should now be successfully deployed to production with:

- ✅ Real PostgreSQL database
- ✅ Redis caching
- ✅ SSL/HTTPS encryption
- ✅ Automated CI/CD deployment
- ✅ Database backups
- ✅ Health monitoring
- ✅ Security hardening

The application will automatically deploy when you push to the `main` branch, with database migrations and health checks included in the process.