#!/bin/bash

# =============================================================================
# PRODUCTION SERVER SETUP SCRIPT
# =============================================================================
# This script automates the setup of a production server for the Restaurant Site
# Run this script on a fresh Ubuntu 20.04+ server
# Usage: ./setup-production-server.sh [domain] [email]

set -euo pipefail

# Configuration
DOMAIN="${1:-}"
EMAIL="${2:-}"
APP_DIR="/opt/restaurant-site"
DEPLOY_USER="deploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  echo -e "${GREEN}[INFO]${NC} $message" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} $message" ;;
        DEBUG) echo -e "${BLUE}[DEBUG]${NC} $message" ;;
    esac
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log ERROR "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
    
    # Check if user has sudo privileges
    if ! sudo -n true 2>/dev/null; then
        log ERROR "This script requires sudo privileges. Please run: sudo -v"
        exit 1
    fi
}

# Validate inputs
validate_inputs() {
    if [[ -z "$DOMAIN" ]]; then
        log ERROR "Domain is required"
        log INFO "Usage: $0 <domain> <email>"
        log INFO "Example: $0 example.com admin@example.com"
        exit 1
    fi
    
    if [[ -z "$EMAIL" ]]; then
        log ERROR "Email is required for SSL certificate"
        log INFO "Usage: $0 <domain> <email>"
        exit 1
    fi
    
    log INFO "Setting up production server for domain: $DOMAIN"
    log INFO "SSL certificate email: $EMAIL"
}

# Update system packages
update_system() {
    log INFO "Updating system packages..."
    
    sudo apt update
    sudo apt upgrade -y
    sudo apt autoremove -y
    
    log INFO "Installing essential packages..."
    sudo apt install -y \
        curl \
        wget \
        git \
        ufw \
        fail2ban \
        htop \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        jq
    
    log INFO "System packages updated successfully"
}

# Configure firewall
setup_firewall() {
    log INFO "Configuring firewall..."
    
    # Reset UFW to default settings
    sudo ufw --force reset
    
    # Set default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow essential services
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    
    # Enable firewall
    sudo ufw --force enable
    
    log INFO "Firewall configured successfully"
}

# Setup fail2ban
setup_fail2ban() {
    log INFO "Configuring fail2ban..."
    
    # Create custom fail2ban configuration
    sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /opt/restaurant-site/docker/nginx/logs/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /opt/restaurant-site/docker/nginx/logs/error.log
maxretry = 10
EOF

    sudo systemctl enable fail2ban
    sudo systemctl restart fail2ban
    
    log INFO "Fail2ban configured successfully"
}

# Install Docker
install_docker() {
    log INFO "Installing Docker..."
    
    # Remove old versions
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    # Start and enable Docker
    sudo systemctl enable docker
    sudo systemctl start docker
    
    log INFO "Docker installed successfully"
}

# Install Docker Compose
install_docker_compose() {
    log INFO "Installing Docker Compose..."
    
    # Download latest Docker Compose
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
    sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symlink for easier access
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log INFO "Docker Compose installed successfully"
}

# Create deploy user
create_deploy_user() {
    log INFO "Creating deploy user..."
    
    # Create deploy user if it doesn't exist
    if ! id "$DEPLOY_USER" &>/dev/null; then
        sudo adduser --disabled-password --gecos "" $DEPLOY_USER
        sudo usermod -aG docker $DEPLOY_USER
        sudo usermod -aG sudo $DEPLOY_USER
        
        log INFO "Deploy user created: $DEPLOY_USER"
    else
        log INFO "Deploy user already exists: $DEPLOY_USER"
    fi
    
    # Setup SSH directory for deploy user
    sudo mkdir -p /home/$DEPLOY_USER/.ssh
    sudo chmod 700 /home/$DEPLOY_USER/.ssh
    
    # Copy current user's authorized_keys if available
    if [[ -f ~/.ssh/authorized_keys ]]; then
        sudo cp ~/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/
        sudo chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
        sudo chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
        log INFO "SSH keys copied to deploy user"
    fi
}

# Setup application directory
setup_app_directory() {
    log INFO "Setting up application directory..."
    
    # Create application directory
    sudo mkdir -p $APP_DIR
    sudo chown $DEPLOY_USER:$DEPLOY_USER $APP_DIR
    
    # Create necessary subdirectories
    sudo -u $DEPLOY_USER mkdir -p $APP_DIR/{docker/nginx/{ssl,logs},backups/{daily,weekly,monthly,manual},scripts}
    
    log INFO "Application directory created: $APP_DIR"
}

# Install and configure SSL with Let's Encrypt
setup_ssl() {
    log INFO "Setting up SSL certificate with Let's Encrypt..."
    
    # Install Certbot
    sudo apt install -y certbot
    
    # Stop any existing web servers
    sudo systemctl stop apache2 2>/dev/null || true
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Generate SSL certificate
    log INFO "Generating SSL certificate for $DOMAIN..."
    if sudo certbot certonly --standalone --agree-tos --no-eff-email --email $EMAIL -d $DOMAIN; then
        log INFO "SSL certificate generated successfully"
        
        # Copy certificates to application directory
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/docker/nginx/ssl/cert.pem
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $APP_DIR/docker/nginx/ssl/private.key
        
        # Generate DH parameters
        sudo openssl dhparam -out $APP_DIR/docker/nginx/ssl/dhparam.pem 2048
        
        # Set correct ownership and permissions
        sudo chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR/docker/nginx/ssl
        sudo chmod 600 $APP_DIR/docker/nginx/ssl/private.key
        
        # Setup automatic renewal
        setup_ssl_renewal
        
        log INFO "SSL certificate configured successfully"
    else
        log ERROR "SSL certificate generation failed"
        log WARN "You can continue with HTTP-only setup or fix DNS/domain issues and rerun SSL setup"
    fi
}

# Setup SSL certificate auto-renewal
setup_ssl_renewal() {
    log INFO "Setting up SSL certificate auto-renewal..."
    
    # Create renewal script
    sudo tee $APP_DIR/scripts/renew-ssl.sh << EOF
#!/bin/bash
set -e

# Renew certificate
certbot renew --quiet \\
    --pre-hook "docker-compose -f $APP_DIR/docker-compose.prod.yml stop nginx 2>/dev/null || true" \\
    --post-hook "docker-compose -f $APP_DIR/docker-compose.prod.yml start nginx 2>/dev/null || true"

# Copy renewed certificates
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/docker/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $APP_DIR/docker/nginx/ssl/private.key

# Set correct permissions
chown $DEPLOY_USER:$DEPLOY_USER $APP_DIR/docker/nginx/ssl/*
chmod 600 $APP_DIR/docker/nginx/ssl/private.key

echo "SSL certificate renewed successfully"
EOF
    
    sudo chmod +x $APP_DIR/scripts/renew-ssl.sh
    sudo chown $DEPLOY_USER:$DEPLOY_USER $APP_DIR/scripts/renew-ssl.sh
    
    # Add to crontab for automatic renewal (runs every Sunday at 3 AM)
    (sudo crontab -u $DEPLOY_USER -l 2>/dev/null || echo "") | grep -v "renew-ssl.sh" | sudo crontab -u $DEPLOY_USER -
    (sudo crontab -u $DEPLOY_USER -l 2>/dev/null; echo "0 3 * * 0 $APP_DIR/scripts/renew-ssl.sh") | sudo crontab -u $DEPLOY_USER -
    
    log INFO "SSL auto-renewal configured"
}

# Setup monitoring and health checks
setup_monitoring() {
    log INFO "Setting up monitoring and health checks..."
    
    # Create health check script
    sudo -u $DEPLOY_USER tee $APP_DIR/scripts/health-check.sh << EOF
#!/bin/bash

DOMAIN="https://$DOMAIN"
LOG_FILE="$APP_DIR/logs/health-check.log"

# Create logs directory
mkdir -p $APP_DIR/logs

# Function to log with timestamp
log_message() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] \$1" | tee -a "\$LOG_FILE"
}

# Check health endpoint
if curl -f -s "\$DOMAIN/api/health" > /dev/null 2>&1; then
    log_message "✅ Health check passed"
    exit 0
else
    log_message "❌ Health check failed"
    
    # Additional diagnostics
    log_message "Docker containers status:"
    docker ps --format "table {{.Names}}\\t{{.Status}}" | tee -a "\$LOG_FILE"
    
    # Check if we can reach the application directly
    if curl -f -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
        log_message "Application is running but not accessible via domain"
    else
        log_message "Application is not responding on localhost:3000"
    fi
    
    exit 1
fi
EOF
    
    sudo chmod +x $APP_DIR/scripts/health-check.sh
    
    # Add health check to crontab (every 5 minutes)
    (sudo crontab -u $DEPLOY_USER -l 2>/dev/null || echo "") | grep -v "health-check.sh" | sudo crontab -u $DEPLOY_USER -
    (sudo crontab -u $DEPLOY_USER -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/scripts/health-check.sh") | sudo crontab -u $DEPLOY_USER -
    
    log INFO "Health monitoring configured"
}

# Create environment template
create_environment_template() {
    log INFO "Creating environment configuration template..."
    
    sudo -u $DEPLOY_USER tee $APP_DIR/.env.production.template << EOF
# =============================================================================
# PRODUCTION ENVIRONMENT VARIABLES
# =============================================================================
# Copy this file to .env.production and update with your actual values

NODE_ENV=production
APP_URL=https://$DOMAIN
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://restaurant_prod_user:CHANGE_THIS_PASSWORD@postgres:5432/restaurant_prod"
POSTGRES_USER=restaurant_prod_user
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=restaurant_prod

# Authentication
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING

# Redis
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

# Cloudinary (Image management)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@$DOMAIN
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@$DOMAIN

# Restaurant Information
RESTAURANT_NAME="Вкусный уголок"
RESTAURANT_PHONE="+7 (495) 123-45-67"
RESTAURANT_EMAIL="info@$DOMAIN"
EOF
    
    log INFO "Environment template created: $APP_DIR/.env.production.template"
}

# Setup log rotation
setup_log_rotation() {
    log INFO "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/restaurant-site << EOF
$APP_DIR/docker/nginx/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $DEPLOY_USER $DEPLOY_USER
    postrotate
        docker kill -s USR1 restaurant-nginx 2>/dev/null || true
    endscript
}

$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $DEPLOY_USER $DEPLOY_USER
}
EOF
    
    log INFO "Log rotation configured"
}

# Display setup summary
display_summary() {
    log INFO "=== PRODUCTION SERVER SETUP COMPLETE ==="
    echo ""
    log INFO "Server Details:"
    log INFO "  - Domain: $DOMAIN"
    log INFO "  - Application Directory: $APP_DIR"
    log INFO "  - Deploy User: $DEPLOY_USER"
    log INFO "  - SSL Certificate: Configured with Let's Encrypt"
    echo ""
    log INFO "Next Steps:"
    log INFO "1. Update GitHub repository secrets with deployment credentials"
    log INFO "2. Copy your repository to $APP_DIR or set up GitHub deployment"
    log INFO "3. Create and configure $APP_DIR/.env.production with your values"
    log INFO "4. Update docker-compose.prod.yml with your container image"
    log INFO "5. Deploy your application using GitHub Actions or manually"
    echo ""
    log INFO "Important Files:"
    log INFO "  - Environment template: $APP_DIR/.env.production.template"
    log INFO "  - SSL certificates: $APP_DIR/docker/nginx/ssl/"
    log INFO "  - Backup script: $APP_DIR/scripts/backup-database.sh"
    log INFO "  - Health check: $APP_DIR/scripts/health-check.sh"
    echo ""
    log INFO "GitHub Secrets Required:"
    log INFO "  - DEPLOY_HOST: $DOMAIN"
    log INFO "  - DEPLOY_USER: $DEPLOY_USER"
    log INFO "  - DEPLOY_SSH_KEY: (SSH private key for $DEPLOY_USER)"
    log INFO "  - DATABASE_URL, NEXTAUTH_SECRET, etc. (from .env.production)"
    echo ""
    log WARN "Remember to:"
    log WARN "  - Logout and login again for Docker group membership"
    log WARN "  - Configure .env.production with strong passwords"
    log WARN "  - Test SSL certificate renewal"
    log WARN "  - Setup monitoring and alerting"
    echo ""
    log INFO "Setup completed successfully! 🚀"
}

# Main execution
main() {
    log INFO "Starting production server setup..."
    
    check_root
    validate_inputs
    
    update_system
    setup_firewall
    setup_fail2ban
    install_docker
    install_docker_compose
    create_deploy_user
    setup_app_directory
    setup_ssl
    setup_monitoring
    create_environment_template
    setup_log_rotation
    
    display_summary
}

# Script usage
usage() {
    cat << EOF
Production Server Setup Script for Restaurant Site

Usage: $0 <domain> <email>

Arguments:
  domain    - Your production domain (e.g., example.com)
  email     - Email address for SSL certificate registration

Examples:
  $0 restaurant.example.com admin@example.com
  $0 myrestaurant.com contact@myrestaurant.com

This script will:
  ✅ Update system packages and install essentials
  ✅ Configure firewall and fail2ban
  ✅ Install Docker and Docker Compose
  ✅ Create deploy user with SSH access
  ✅ Setup application directory structure
  ✅ Generate SSL certificate with Let's Encrypt
  ✅ Configure automatic certificate renewal
  ✅ Setup health monitoring and log rotation
  ✅ Create environment configuration template

Requirements:
  - Ubuntu 20.04+ server
  - sudo privileges
  - Domain pointing to server IP
  - Port 80/443 accessible from internet

EOF
}

# Check if help is requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

# Run main function
main "$@"