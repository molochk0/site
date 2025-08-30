# GitHub CI/CD Production Deployment Setup

## Overview

This design outlines the implementation of a comprehensive GitHub CI/CD pipeline for deploying the restaurant site to a production environment with real database integration. The solution builds upon the existing CI/CD infrastructure and extends it with production deployment capabilities, database management, and environment configuration.

## Architecture

### Current State Analysis

The repository already includes:
- Basic CI/CD pipeline (`ci-cd.yml`) with quality checks, Docker builds, and placeholder deployment steps
- Production Docker configuration (`docker-compose.prod.yml`) with PostgreSQL, Redis, Next.js app, and Nginx
- Multi-stage Dockerfile optimized for production builds
- Environment configuration system with separate production settings

### Target Production Architecture

```mermaid
graph TB
    subgraph "GitHub Repository"
        A[Code Push] --> B[GitHub Actions]
        B --> C[Quality Checks]
        C --> D[Docker Build]
        D --> E[Security Scan]
        E --> F[Deploy to Production]
    end
    
    subgraph "Production Server"
        F --> G[Docker Registry Pull]
        G --> H[Database Migration]
        H --> I[Zero-Downtime Deployment]
        I --> J[Health Checks]
        
        subgraph "Application Stack"
            K[Nginx Proxy] --> L[Next.js App]
            L --> M[PostgreSQL Database]
            L --> N[Redis Cache]
        end
    end
    
    subgraph "External Services"
        O[Domain/SSL]
        P[Monitoring]
        Q[Backup Storage]
    end
```

## Production Environment Setup

### Server Infrastructure Requirements

#### Minimum Server Specifications
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB SSD with backup capability
- **Network**: Static IP address with domain pointing
- **OS**: Ubuntu 20.04 LTS or similar

#### Required Software Installation
```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Database Setup Strategy

#### Production Database Configuration
The production environment uses PostgreSQL with the following configuration:

```yaml
# PostgreSQL Production Settings
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: restaurant_prod_user
    POSTGRES_PASSWORD: [secure_password]
    POSTGRES_DB: restaurant_prod
  volumes:
    - postgres_prod_data:/var/lib/postgresql/data
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

#### Database Migration Strategy
```mermaid
sequenceDiagram
    participant CI as "CI/CD Pipeline"
    participant Server as "Production Server"
    participant DB as "PostgreSQL Database"
    participant App as "Next.js Application"
    
    CI->>Server: Deploy new image
    Server->>DB: Run migrations (prisma migrate deploy)
    DB-->>Server: Migration complete
    Server->>App: Start new container
    App->>DB: Test connection
    DB-->>App: Connection successful
    Server->>CI: Deployment complete
```

## GitHub Actions Pipeline Enhancement

### Enhanced Workflow Structure

```yaml
# Key pipeline stages for production deployment
stages:
  1. quality:          # Code quality and testing
  2. build:            # Docker image creation
  3. security:         # Security scanning
  4. deploy-staging:   # Staging deployment (develop branch)
  5. deploy-production: # Production deployment (main branch)
  6. rollback:         # Automatic rollback on failure
```

### Production Deployment Process

#### Environment Variables Configuration
Required GitHub Secrets for production:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DEPLOY_HOST` | Production server IP/domain | `your-domain.com` |
| `DEPLOY_USER` | SSH username | `deploy` |
| `DEPLOY_SSH_KEY` | Private SSH key | `-----BEGIN RSA PRIVATE KEY-----` |
| `DATABASE_URL` | Production database connection | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Authentication secret | `random-secure-string` |
| `NEXTAUTH_URL` | Production URL | `https://your-domain.com` |
| `POSTGRES_PASSWORD` | Database password | `secure-database-password` |
| `REDIS_PASSWORD` | Redis password | `secure-redis-password` |

#### Deployment Flow
```mermaid
flowchart TD
    A[Code Push to main] --> B[Quality Checks]
    B --> C[Docker Build & Push]
    C --> D[Security Scan]
    D --> E[SSH to Production Server]
    E --> F[Pull Latest Image]
    F --> G[Update Environment]
    G --> H[Run Database Migrations]
    H --> I[Zero-Downtime Deployment]
    I --> J[Health Checks]
    J --> K{Health Check Pass?}
    K -->|Yes| L[Deployment Success]
    K -->|No| M[Automatic Rollback]
    M --> N[Notify Failure]
```

### Database Migration Integration

#### Migration Safety Measures
```bash
# Pre-deployment database backup
docker exec restaurant-postgres-prod pg_dump \
  -U restaurant_prod_user \
  -d restaurant_prod \
  --clean --if-exists \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Migration execution with rollback capability
docker run --rm --env-file .env.production \
  -v $(pwd)/prisma:/app/prisma \
  ${{ needs.build.outputs.image }} \
  npx prisma migrate deploy
```

## Environment Configuration Management

### Production Environment Variables

#### Application Configuration
```bash
# Core application settings
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Database configuration
DATABASE_URL=postgresql://restaurant_prod_user:${POSTGRES_PASSWORD}@postgres:5432/restaurant_prod
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
SESSION_MAX_AGE=86400

# Redis caching
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# External services
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
```

#### Security Configuration
```bash
# Security settings
ENABLE_ANALYTICS=true
ENABLE_MAINTENANCE_MODE=false
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# SSL and security headers
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/private.key
```

## Zero-Downtime Deployment Strategy

### Deployment Methodology

#### Blue-Green Deployment Approach
```mermaid
graph LR
    subgraph "Load Balancer (Nginx)"
        A[Nginx]
    end
    
    subgraph "Blue Environment (Current)"
        B[App Container v1.0]
        C[Database]
    end
    
    subgraph "Green Environment (New)"
        D[App Container v1.1]
        E[Shared Database]
    end
    
    A --> B
    A -.-> D
    B --> C
    D --> E
    C --- E
```

#### Deployment Steps
1. **Health Check Current Environment**: Verify current deployment is healthy
2. **Deploy New Container**: Start new application container alongside current
3. **Database Migration**: Apply schema changes with backward compatibility
4. **Traffic Switch**: Update load balancer to route to new container
5. **Verification**: Perform health checks on new deployment
6. **Cleanup**: Remove old container after successful verification

### Rollback Mechanism

#### Automatic Rollback Triggers
- Health check failures after deployment
- Application startup errors
- Database migration failures
- High error rates detected

#### Rollback Process
```bash
# Automatic rollback script
if [ $HEALTH_CHECK_FAILED ]; then
  echo "Health check failed, initiating rollback..."
  docker-compose -f docker-compose.prod.yml down
  docker tag $PREVIOUS_IMAGE $CURRENT_IMAGE
  docker-compose -f docker-compose.prod.yml up -d
  echo "Rollback completed"
fi
```

## Monitoring and Health Checks

### Application Health Monitoring

#### Health Check Endpoints
```javascript
// Health check implementation
GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "external_apis": "available"
  },
  "version": "1.2.0"
}
```

#### Monitoring Integration
```mermaid
graph TB
    A[Application] --> B[Health Endpoint]
    B --> C[Docker Health Check]
    B --> D[External Monitoring]
    C --> E[Container Restart]
    D --> F[Alert System]
    F --> G[DevOps Team]
```

### Performance Metrics

#### Key Performance Indicators
- Application response time (< 200ms target)
- Database query performance (< 100ms average)
- Memory usage (< 80% of allocated)
- CPU utilization (< 70% average)
- Error rate (< 0.1% of requests)

## Security Considerations

### Production Security Measures

#### Network Security
```nginx
# Nginx security configuration
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000";
}
```

#### Container Security
- Non-root user execution (`nextjs:nodejs`)
- Read-only file systems where possible
- Resource limitations and quotas
- Regular security scanning with Trivy

#### Database Security
- Encrypted connections (SSL/TLS)
- Strong password policies
- Limited user privileges
- Regular automated backups

### Secret Management

#### GitHub Secrets Strategy
```yaml
# Secret organization
Production Secrets:
  - Database credentials
  - Authentication secrets
  - SSL certificates
  - External API keys
  
Development Secrets:
  - Test database credentials
  - Development API keys
  
Shared Secrets:
  - Docker registry access
  - SSH deployment keys
```

## Backup and Disaster Recovery

### Database Backup Strategy

#### Automated Backup Process
```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/opt/backups/restaurant-site"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker exec restaurant-postgres-prod pg_dump \
  -U restaurant_prod_user \
  -d restaurant_prod \
  --clean --if-exists \
  > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Upload to cloud storage (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" \
  s3://restaurant-backups/database/
```

#### Recovery Procedures
```mermaid
flowchart TD
    A[Disaster Detected] --> B[Stop Application]
    B --> C[Restore Database]
    C --> D[Verify Data Integrity]
    D --> E[Restart Application]
    E --> F[Run Health Checks]
    F --> G{System Healthy?}
    G -->|Yes| H[Resume Operations]
    G -->|No| I[Investigate Issues]
```

## Implementation Checklist

### Pre-Deployment Setup
- [ ] Server provisioning and Docker installation
- [ ] Domain configuration and SSL certificate setup
- [ ] GitHub repository secrets configuration
- [ ] Production database setup and user creation
- [ ] SSH key generation and server access configuration

### Pipeline Configuration
- [ ] Update GitHub Actions workflow with production deployment steps
- [ ] Configure Docker registry access and image management
- [ ] Set up security scanning and vulnerability reporting
- [ ] Implement health check endpoints and monitoring

### Database Migration
- [ ] Review and test all Prisma migrations
- [ ] Set up automated backup procedures
- [ ] Configure database connection pooling
- [ ] Implement migration rollback procedures

### Security Hardening
- [ ] Configure Nginx with SSL and security headers
- [ ] Set up firewall rules and access controls
- [ ] Implement rate limiting and DDoS protection
- [ ] Configure log aggregation and monitoring

### Testing and Validation
- [ ] Perform end-to-end deployment testing
- [ ] Validate rollback procedures
- [ ] Test database backup and restore processes
- [ ] Verify monitoring and alerting systems

This design provides a comprehensive foundation for deploying your restaurant site to production with a real database, ensuring security, reliability, and maintainability of the deployment process.