# GitHub Secrets Configuration Guide

## Overview

This guide explains how to configure GitHub repository secrets for automated production deployment of the Restaurant Site with real database integration.

## Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 🔐 Server Access Secrets

#### `DEPLOY_HOST`
- **Description**: Production server IP address or domain name
- **Example**: `your-domain.com` or `192.168.1.100`
- **Required**: ✅ Yes

#### `DEPLOY_USER`
- **Description**: SSH username for deployment
- **Example**: `deploy` (recommended) or `ubuntu`
- **Required**: ✅ Yes

#### `DEPLOY_SSH_KEY`
- **Description**: Private SSH key for server access
- **Format**: Complete RSA private key including headers
- **Required**: ✅ Yes

**How to generate and configure SSH key:**

```bash
# 1. Generate SSH key pair (on your local machine)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/restaurant_deploy_key -C "deployment@restaurant-site"

# 2. Copy public key to server
ssh-copy-id -i ~/.ssh/restaurant_deploy_key.pub deploy@your-domain.com

# 3. Test connection
ssh -i ~/.ssh/restaurant_deploy_key deploy@your-domain.com

# 4. Copy private key content for GitHub secret
cat ~/.ssh/restaurant_deploy_key
```

Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) to the `DEPLOY_SSH_KEY` secret.

### 🗄️ Database Secrets

#### `DATABASE_URL`
- **Description**: PostgreSQL connection string for production
- **Format**: `postgresql://username:password@host:port/database?sslmode=require`
- **Example**: `postgresql://restaurant_prod_user:strong_password@localhost:5432/restaurant_prod?sslmode=require`
- **Required**: ✅ Yes

#### `POSTGRES_PASSWORD`
- **Description**: PostgreSQL database password
- **Example**: `super_strong_database_password_123!`
- **Required**: ✅ Yes
- **Security**: Use a strong, unique password (16+ characters, mixed case, numbers, symbols)

**How to generate strong password:**
```bash
openssl rand -base64 32
```

### 🔐 Authentication Secrets

#### `NEXTAUTH_SECRET`
- **Description**: NextAuth.js secret key for session encryption
- **Format**: Random string (32+ characters recommended)
- **Required**: ✅ Yes

**How to generate:**
```bash
openssl rand -base64 32
```

#### `NEXTAUTH_URL`
- **Description**: Production application URL
- **Example**: `https://your-domain.com`
- **Required**: ✅ Yes

### 🏪 Cache & Storage Secrets

#### `REDIS_PASSWORD`
- **Description**: Redis cache password
- **Example**: `redis_strong_password_456!`
- **Required**: ✅ Yes

**How to generate:**
```bash
openssl rand -base64 24
```

### ☁️ Cloudinary Secrets (Image Management)

#### `CLOUDINARY_CLOUD_NAME`
- **Description**: Cloudinary cloud name
- **Example**: `restaurant-production`
- **Required**: ⚠️ Optional (but recommended)

#### `CLOUDINARY_API_KEY`
- **Description**: Cloudinary API key
- **Example**: `123456789012345`
- **Required**: ⚠️ Optional (if using Cloudinary)

#### `CLOUDINARY_API_SECRET`
- **Description**: Cloudinary API secret
- **Example**: `abcdef123456789`
- **Required**: ⚠️ Optional (if using Cloudinary)

## Step-by-Step Setup Process

### Step 1: Server Setup
1. Run the server setup script on your production server:
   ```bash
   ./scripts/setup-production-server.sh your-domain.com admin@your-domain.com
   ```

### Step 2: Generate Secrets
2. Generate strong passwords and keys:
   ```bash
   # Database password
   echo "POSTGRES_PASSWORD: $(openssl rand -base64 32)"
   
   # NextAuth secret
   echo "NEXTAUTH_SECRET: $(openssl rand -base64 32)"
   
   # Redis password
   echo "REDIS_PASSWORD: $(openssl rand -base64 24)"
   ```

### Step 3: Configure GitHub Secrets
3. Add each secret to GitHub repository:
   - Go to `https://github.com/YOUR_USERNAME/restaurant-site/settings/secrets/actions`
   - Click "New repository secret"
   - Add each secret one by one

### Step 4: Verify Configuration
4. Check that all required secrets are configured:

| Secret Name | Status | Value Preview |
|-------------|--------|---------------|
| `DEPLOY_HOST` | ✅ Set | `your-domain.com` |
| `DEPLOY_USER` | ✅ Set | `deploy` |
| `DEPLOY_SSH_KEY` | ✅ Set | `-----BEGIN RSA PRIVATE...` |
| `DATABASE_URL` | ✅ Set | `postgresql://restaurant_...` |
| `POSTGRES_PASSWORD` | ✅ Set | `***hidden***` |
| `NEXTAUTH_SECRET` | ✅ Set | `***hidden***` |
| `NEXTAUTH_URL` | ✅ Set | `https://your-domain.com` |
| `REDIS_PASSWORD` | ✅ Set | `***hidden***` |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ Optional | `restaurant-prod` |
| `CLOUDINARY_API_KEY` | ⚠️ Optional | `***hidden***` |
| `CLOUDINARY_API_SECRET` | ⚠️ Optional | `***hidden***` |

## Security Best Practices

### 🔒 Password Security
- Use unique passwords for each service
- Minimum 16 characters for database passwords
- Include uppercase, lowercase, numbers, and symbols
- Never reuse passwords from development

### 🔑 SSH Key Security
- Use RSA 4096-bit keys or ED25519 keys
- Set passphrase on private keys (optional but recommended)
- Rotate keys annually
- Use dedicated keys for deployment (don't reuse personal keys)

### 📱 Secret Management
- Regularly rotate secrets (quarterly recommended)
- Monitor secret usage in GitHub Actions logs
- Use separate secrets for staging/production
- Never commit secrets to repository

### 🔍 Access Control
- Limit repository access to necessary team members
- Use organization-level secrets for shared resources
- Enable branch protection rules for main branch
- Require pull request reviews for secret changes

## Validation Script

Create a validation script to test your secrets:

```bash
#!/bin/bash
# save as scripts/validate-secrets.sh

echo "🔍 Validating GitHub Secrets Configuration..."

# Test SSH connection
if ssh -i ~/.ssh/restaurant_deploy_key -o ConnectTimeout=10 $DEPLOY_USER@$DEPLOY_HOST "echo 'SSH connection successful'"; then
    echo "✅ SSH connection working"
else
    echo "❌ SSH connection failed"
fi

# Test domain resolution
if nslookup $DEPLOY_HOST > /dev/null; then
    echo "✅ Domain resolves correctly"
else
    echo "❌ Domain resolution failed"
fi

# Test SSL certificate
if curl -s https://$DEPLOY_HOST > /dev/null; then
    echo "✅ SSL certificate working"
else
    echo "⚠️ SSL certificate not accessible (normal for new setup)"
fi

echo "🏁 Validation complete"
```

## Troubleshooting Common Issues

### SSH Connection Failed
```bash
# Test SSH connection manually
ssh -vvv -i ~/.ssh/restaurant_deploy_key deploy@your-domain.com

# Common fixes:
# 1. Check SSH key permissions
chmod 600 ~/.ssh/restaurant_deploy_key

# 2. Verify public key on server
cat ~/.ssh/restaurant_deploy_key.pub
# Compare with /home/deploy/.ssh/authorized_keys on server

# 3. Check firewall
sudo ufw status
```

### Database Connection Failed
```bash
# Test database connection from server
docker exec restaurant-postgres-prod psql -U restaurant_prod_user -d restaurant_prod -c "SELECT 1;"

# Check if database container is running
docker ps | grep postgres
```

### SSL Certificate Issues
```bash
# Check certificate validity
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Renew certificate manually
sudo certbot renew --force-renewal
```

## Deployment Test

After configuring all secrets, test the deployment:

1. **Trigger deployment** by pushing to main branch:
   ```bash
   git add .
   git commit -m "Configure production deployment"
   git push origin main
   ```

2. **Monitor deployment** in GitHub Actions:
   - Go to repository → Actions tab
   - Watch the CI/CD pipeline execution
   - Check for any failures in deployment steps

3. **Verify deployment** by accessing your site:
   ```bash
   curl https://your-domain.com/api/health
   ```

## Recovery Procedures

### If Deployment Fails
1. Check GitHub Actions logs for specific error
2. Verify all secrets are correctly configured
3. Test SSH connection manually
4. Check server resources (disk space, memory)
5. Review application logs on server

### Emergency Access
```bash
# Direct server access for troubleshooting
ssh -i ~/.ssh/restaurant_deploy_key deploy@your-domain.com

# Check application status
cd /opt/restaurant-site
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs
```

## Support

For additional help:
1. Review deployment logs in GitHub Actions
2. Check server logs: `/opt/restaurant-site/logs/`
3. Verify all secrets match the production environment file
4. Test each component individually before full deployment

Remember: Never share secrets in plain text, always use secure communication channels when coordinating with team members.