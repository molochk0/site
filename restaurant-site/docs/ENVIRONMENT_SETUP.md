# Environment Setup Guide

This guide explains how to configure environment variables for different deployment environments.

## Overview

The application uses environment-specific configuration files to manage different settings for development, testing, and production environments.

## Environment Files

### `.env.example`
Template file showing all available environment variables with descriptions. Use this as a reference for setting up your own environment files.

### `.env.local` (Development)
Copy `.env.example` to `.env.local` for local development:
```bash
cp .env.example .env.local
```

### `.env.production`
Production environment configuration. Used for production deployments.

### `.env.test`
Test environment configuration. Used when running tests.

## Required Environment Variables

### Database Configuration
```bash
# Database connection URL
DATABASE_URL="postgresql://username:password@host:port/database"

# Connection pool settings
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000
```

### NextAuth Configuration
```bash
# Authentication URL (update for each environment)
NEXTAUTH_URL="http://localhost:3000"

# Secret key for JWT signing (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key"
```

## Optional Environment Variables

### Authentication Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to `{your-domain}/api/auth/callback/github`

```bash
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Image Upload (Cloudinary)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret from dashboard

```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_FOLDER="restaurant-images"
```

### Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password (not your regular password)

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

EMAIL_FROM="noreply@yourdomain.com"
EMAIL_TO_ADMIN="admin@yourdomain.com"
```

### Analytics

#### Google Analytics
```bash
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

#### Google Tag Manager
```bash
GTM_ID="GTM-XXXXXXX"
```

## Environment-Specific Setup

### Development Environment

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update required variables:
   - `DATABASE_URL`: Use local PostgreSQL or Prisma local server
   - `NEXTAUTH_SECRET`: Any string for development
   - `NEXTAUTH_URL`: `http://localhost:3000`

3. Optional: Configure external services for full functionality

### Production Environment

1. Use `.env.production` as a template
2. **Important**: Use strong, unique values for all secrets
3. Update all URLs to production domains
4. Configure production database
5. Set up monitoring (Sentry)
6. Configure email SMTP
7. Set feature flags appropriately

### Test Environment

1. The test environment uses `.env.test`
2. Uses separate test database
3. Disables external services (emails, analytics)
4. Uses mock data where possible

## Security Best Practices

### Secrets Management
- **Never commit `.env.local` or `.env.production` to version control**
- Use strong, randomly generated secrets in production
- Rotate secrets regularly
- Use environment-specific secrets (don't reuse between environments)

### Database Security
- Use connection pooling in production
- Set connection limits and timeouts
- Use SSL connections for production databases
- Regularly backup production data

### API Keys
- Restrict API keys to specific domains/IPs where possible
- Monitor API usage for unusual activity
- Use separate API keys for different environments
- Regularly rotate API keys

## Environment Validation

The application automatically validates environment variables on startup using the `src/lib/env.ts` configuration file.

If required variables are missing or invalid, the application will fail to start with a detailed error message.

## Deployment-Specific Instructions

### Vercel
1. Set environment variables in Vercel dashboard
2. Use different values for preview and production deployments
3. Configure build-time vs runtime variables appropriately

### Docker
1. Use `.env.production` file
2. Pass environment variables via docker-compose or command line
3. Use secrets management for sensitive values

### Traditional Hosting
1. Set environment variables in hosting control panel
2. Ensure all required variables are set before deployment
3. Test with a staging environment first

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify DATABASE_URL format
- Check database server is running
- Verify network connectivity
- Check connection limits

#### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Verify OAuth provider configuration

#### Image Upload Failures
- Check Cloudinary credentials
- Verify API key permissions
- Check folder permissions

### Environment Validation Errors
The application will show specific validation errors on startup. Common fixes:
- Ensure required variables are set
- Check variable format (URLs, numbers, booleans)
- Verify no typos in variable names

## Getting Help

If you encounter issues:
1. Check this documentation
2. Verify environment variables are correctly set
3. Check application logs for specific error messages
4. Ensure external services (database, Cloudinary, etc.) are accessible

## Environment Variables Reference

See `.env.example` for a complete list of available environment variables with descriptions and example values.