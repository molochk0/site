# Docker Deployment Guide

This guide explains how to deploy the restaurant website using Docker containers.

## Overview

The application uses Docker for containerization with separate configurations for development and production environments.

## Files Structure

```
restaurant-site/
├── Dockerfile                    # Production container
├── Dockerfile.dev               # Development container  
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── healthcheck.js               # Health check script
├── docker/
│   ├── nginx/
│   │   └── nginx.conf          # Nginx configuration
│   └── postgres/
│       └── init/
│           └── 01-init.sql     # Database initialization
└── .dockerignore               # Docker ignore rules
```

## Development Environment

### Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd restaurant-site
   cp .env.example .env.local
   ```

2. **Start development environment**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**:
   ```bash
   docker-compose exec app npm run db:migrate
   ```

4. **Seed database** (optional):
   ```bash
   docker-compose exec app npm run db:seed
   ```

### Services

- **App**: Next.js application on port 3000
- **PostgreSQL**: Database on port 5432
- **Redis**: Caching on port 6379
- **MailHog**: Email testing on ports 1025 (SMTP) and 8025 (Web UI)

### Development Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Execute commands in app container
docker-compose exec app npm run <command>

# Stop all services
docker-compose down

# Rebuild services
docker-compose up --build -d
```

## Production Environment

### Prerequisites

1. **Server requirements**:
   - Docker and Docker Compose installed
   - Minimum 2GB RAM, 2 CPU cores
   - 20GB+ disk space

2. **Environment variables**:
   - Copy `.env.production` and update all values
   - Set strong passwords for database and Redis
   - Configure external services (Cloudinary, SMTP, etc.)

### Production Deployment

1. **Prepare environment**:
   ```bash
   cp .env.production .env
   # Edit .env with production values
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run database migrations**:
   ```bash
   docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   ```

4. **Verify deployment**:
   ```bash
   curl http://localhost/api/health
   ```

### Production Services

- **App**: Next.js application (internal port 3000)
- **Nginx**: Reverse proxy on ports 80/443
- **PostgreSQL**: Production database
- **Redis**: Caching layer

## Environment Variables

### Required Production Variables

```bash
# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=strong_database_password
POSTGRES_DB=restaurant_prod
DATABASE_URL=postgresql://user:password@postgres:5432/restaurant_prod

# Redis
REDIS_PASSWORD=strong_redis_password

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong_nextauth_secret_32_chars_min

# External services
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## SSL/HTTPS Setup

### Option 1: Let's Encrypt with Certbot

1. **Install Certbot**:
   ```bash
   docker run --rm -v /etc/letsencrypt:/etc/letsencrypt \
     -v /var/www/certbot:/var/www/certbot \
     -p 80:80 certbot/certbot certonly \
     --standalone -d yourdomain.com
   ```

2. **Update nginx.conf** for SSL and restart

### Option 2: Manual SSL Certificate

1. Place certificates in `docker/nginx/ssl/`
2. Update nginx configuration
3. Restart nginx container

## Monitoring and Maintenance

### Health Checks

- Application health: `GET /api/health`
- Database connectivity included in health check
- Docker health checks configured for all services

### Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs app

# Database logs  
docker-compose -f docker-compose.prod.yml logs postgres

# Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres restaurant_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres restaurant_prod < backup_file.sql
```

### Updates and Maintenance

```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app

# Database migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

## Performance Tuning

### PostgreSQL Optimization

Add to docker-compose.prod.yml:
```yaml
postgres:
  command: postgres -c shared_preload_libraries=pg_stat_statements
  environment:
    - POSTGRES_SHARED_PRELOAD_LIBRARIES=pg_stat_statements
```

### Redis Optimization

Configure memory limits and eviction policies in docker-compose.prod.yml.

### Nginx Caching

Static assets are cached for 1 year, API responses as configured.

## Security Considerations

1. **Network Security**:
   - Use custom bridge networks
   - Expose only necessary ports
   - Configure firewall rules

2. **Container Security**:
   - Non-root user in containers
   - Read-only file systems where possible
   - Regular security updates

3. **Data Security**:
   - Encrypted database connections
   - Secure Redis with password
   - Regular backups with encryption

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check DATABASE_URL format
   - Verify postgres container is running
   - Check network connectivity

2. **Application Won't Start**:
   - Check environment variables
   - Review application logs
   - Verify all required services are running

3. **Nginx 502 Errors**:
   - Check if app container is healthy
   - Verify nginx configuration
   - Check upstream connectivity

### Debug Commands

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Inspect networks
docker network ls
docker network inspect restaurant-site_restaurant-network

# Container resource usage
docker stats

# Execute shell in container
docker-compose -f docker-compose.prod.yml exec app sh
```

## Scaling

### Horizontal Scaling

1. Use Docker Swarm or Kubernetes
2. Configure load balancer
3. Use external database and Redis
4. Implement session affinity if needed

### Vertical Scaling

Update resource limits in docker-compose.prod.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.5'
```

## Backup and Disaster Recovery

1. **Database Backups**: Automated daily backups to external storage
2. **Application Code**: Git repository with tagged releases
3. **Configuration**: Environment files stored securely
4. **Container Images**: Registry with versioned images

For more detailed instructions, see the deployment documentation in `/docs/DEPLOYMENT.md`.