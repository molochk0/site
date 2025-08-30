#!/bin/bash

# =============================================================================
# DATABASE BACKUP SCRIPT FOR PRODUCTION
# =============================================================================
# This script creates automated backups of the PostgreSQL database
# Usage: ./backup-database.sh [backup_type]
# backup_type: daily (default), weekly, monthly, manual

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Database configuration
DB_CONTAINER_NAME="restaurant-postgres-prod"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-restaurant_prod}"

# Backup retention (days)
DAILY_RETENTION=7
WEEKLY_RETENTION=4
MONTHLY_RETENTION=12

# Load environment variables if available
if [ -f "${PROJECT_DIR}/.env.production" ]; then
    source "${PROJECT_DIR}/.env.production"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Check if Docker container is running
check_container() {
    if ! docker ps | grep -q "$DB_CONTAINER_NAME"; then
        log ERROR "Database container '$DB_CONTAINER_NAME' is not running"
        exit 1
    fi
    log INFO "Database container is running"
}

# Create backup directory
setup_backup_dir() {
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly,manual}
    log INFO "Backup directories created/verified"
}

# Generate backup filename
generate_backup_filename() {
    local backup_type=$1
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    echo "${backup_type}_backup_${timestamp}.sql"
}

# Create database backup
create_backup() {
    local backup_type=$1
    local backup_filename=$(generate_backup_filename "$backup_type")
    local backup_path="${BACKUP_DIR}/${backup_type}/${backup_filename}"
    
    log INFO "Starting $backup_type backup: $backup_filename"
    
    # Create the backup
    if docker exec "$DB_CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --create \
        --verbose > "$backup_path" 2>>"$LOG_FILE"; then
        
        # Compress the backup
        gzip "$backup_path"
        local compressed_path="${backup_path}.gz"
        
        # Get file size
        local file_size=$(du -h "$compressed_path" | cut -f1)
        
        log INFO "Backup completed successfully: ${compressed_path} (${file_size})"
        
        # Verify backup integrity
        if verify_backup "$compressed_path"; then
            log INFO "Backup verification passed"
        else
            log WARN "Backup verification failed"
        fi
        
        # Update latest symlink
        ln -sf "$(basename "$compressed_path")" "${BACKUP_DIR}/${backup_type}/latest.sql.gz"
        
        return 0
    else
        log ERROR "Backup failed for $backup_type"
        rm -f "$backup_path" 2>/dev/null || true
        return 1
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_file=$1
    
    log DEBUG "Verifying backup: $backup_file"
    
    # Check if file exists and is not empty
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        log ERROR "Backup file is missing or empty"
        return 1
    fi
    
    # Check if gzip file is valid
    if ! gzip -t "$backup_file" 2>/dev/null; then
        log ERROR "Backup file is corrupted (gzip test failed)"
        return 1
    fi
    
    # Check if SQL content is valid (basic check)
    if ! zcat "$backup_file" | head -20 | grep -q "PostgreSQL database dump"; then
        log ERROR "Backup file doesn't appear to be a valid PostgreSQL dump"
        return 1
    fi
    
    return 0
}

# Clean old backups
cleanup_old_backups() {
    local backup_type=$1
    local retention_days
    
    case $backup_type in
        daily)   retention_days=$DAILY_RETENTION ;;
        weekly)  retention_days=$((WEEKLY_RETENTION * 7)) ;;
        monthly) retention_days=$((MONTHLY_RETENTION * 30)) ;;
        manual)  return 0 ;; # Don't auto-cleanup manual backups
        *)       log WARN "Unknown backup type: $backup_type"; return 1 ;;
    esac
    
    local backup_dir="${BACKUP_DIR}/${backup_type}"
    local cleaned_count=0
    
    log INFO "Cleaning up $backup_type backups older than $retention_days days"
    
    # Find and remove old backups
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((cleaned_count++))
        log DEBUG "Removed old backup: $(basename "$file")"
    done < <(find "$backup_dir" -name "*.sql.gz" -type f -mtime +$retention_days -print0 2>/dev/null)
    
    if [ $cleaned_count -gt 0 ]; then
        log INFO "Cleaned up $cleaned_count old $backup_type backup(s)"
    else
        log DEBUG "No old $backup_type backups to clean up"
    fi
}

# Upload to cloud storage (if configured)
upload_to_cloud() {
    local backup_file=$1
    local backup_type=$2
    
    # AWS S3 upload (if configured)
    if [ -n "${AWS_S3_BUCKET:-}" ] && [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
        log INFO "Uploading backup to AWS S3..."
        
        local s3_path="s3://${AWS_S3_BUCKET}/database-backups/${backup_type}/$(basename "$backup_file")"
        
        if aws s3 cp "$backup_file" "$s3_path" 2>>"$LOG_FILE"; then
            log INFO "Backup uploaded to S3: $s3_path"
        else
            log ERROR "Failed to upload backup to S3"
        fi
    fi
    
    # Add other cloud providers here (Google Cloud, Azure, etc.)
}

# Get backup statistics
show_backup_stats() {
    log INFO "=== Backup Statistics ==="
    
    for backup_type in daily weekly monthly manual; do
        local backup_dir="${BACKUP_DIR}/${backup_type}"
        if [ -d "$backup_dir" ]; then
            local count=$(find "$backup_dir" -name "*.sql.gz" -type f | wc -l)
            local total_size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1 || echo "0B")
            log INFO "$backup_type backups: $count files, $total_size total"
        fi
    done
    
    log INFO "========================="
}

# Restore database from backup
restore_from_backup() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        log ERROR "Backup file not found: $backup_file"
        exit 1
    fi
    
    log WARN "This will restore the database from: $backup_file"
    read -p "Are you sure you want to continue? (y/N): " -r
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log INFO "Restore cancelled"
        exit 0
    fi
    
    log INFO "Starting database restore..."
    
    # Stop the application to prevent connections
    log INFO "Stopping application..."
    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.prod.yml stop app
    
    # Restore the database
    if zcat "$backup_file" | docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"; then
        log INFO "Database restore completed successfully"
    else
        log ERROR "Database restore failed"
        exit 1
    fi
    
    # Restart the application
    log INFO "Restarting application..."
    docker-compose -f docker-compose.prod.yml start app
    
    log INFO "Restore process completed"
}

# Main function
main() {
    local backup_type="${1:-daily}"
    local action="${2:-backup}"
    
    # Setup logging
    setup_backup_dir
    
    log INFO "Starting backup script - Type: $backup_type, Action: $action"
    
    case $action in
        backup)
            check_container
            
            if create_backup "$backup_type"; then
                cleanup_old_backups "$backup_type"
                
                # Upload to cloud if configured
                local latest_backup="${BACKUP_DIR}/${backup_type}/latest.sql.gz"
                if [ -f "$latest_backup" ]; then
                    upload_to_cloud "$latest_backup" "$backup_type"
                fi
                
                show_backup_stats
                log INFO "Backup process completed successfully"
            else
                log ERROR "Backup process failed"
                exit 1
            fi
            ;;
            
        restore)
            local backup_file="${3:-}"
            if [ -z "$backup_file" ]; then
                log ERROR "Please specify backup file to restore from"
                log INFO "Usage: $0 $backup_type restore /path/to/backup.sql.gz"
                exit 1
            fi
            restore_from_backup "$backup_file"
            ;;
            
        stats)
            show_backup_stats
            ;;
            
        cleanup)
            for btype in daily weekly monthly; do
                cleanup_old_backups "$btype"
            done
            ;;
            
        *)
            log ERROR "Unknown action: $action"
            log INFO "Available actions: backup, restore, stats, cleanup"
            exit 1
            ;;
    esac
}

# Script usage
usage() {
    cat << EOF
Database Backup Script for Restaurant Site

Usage: $0 [backup_type] [action] [options]

Backup Types:
  daily     - Daily backup (retained for $DAILY_RETENTION days)
  weekly    - Weekly backup (retained for $WEEKLY_RETENTION weeks)
  monthly   - Monthly backup (retained for $MONTHLY_RETENTION months)
  manual    - Manual backup (never auto-deleted)

Actions:
  backup    - Create a new backup (default)
  restore   - Restore from a backup file
  stats     - Show backup statistics
  cleanup   - Clean up old backups

Examples:
  $0                                    # Create daily backup
  $0 weekly                            # Create weekly backup
  $0 manual                           # Create manual backup
  $0 daily restore /path/backup.sql.gz # Restore from backup
  $0 stats                            # Show backup statistics
  $0 cleanup                          # Clean up old backups

Environment Variables:
  POSTGRES_USER     - Database user (default: postgres)
  POSTGRES_DB       - Database name (default: restaurant_prod)
  AWS_S3_BUCKET     - S3 bucket for cloud backups
  AWS_ACCESS_KEY_ID - AWS access key for S3

EOF
}

# Check if help is requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

# Run main function
main "$@"