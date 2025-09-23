#!/bin/bash

# Deployment script for Premium Catalog IA

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="premiumcatalogoia"
DEPLOY_USER="deploy"
DEPLOY_HOST="production.server.com"
DEPLOY_PATH="/var/www/${APP_NAME}"
BACKUP_PATH="/var/backups/${APP_NAME}"
GIT_REPO="https://github.com/Santiago13dev/premiumcatalogoia.git"
BRANCH="main"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check requirements
check_requirements() {
    log_info "Checking requirements..."
    
    command -v git >/dev/null 2>&1 || log_error "git is required but not installed"
    command -v node >/dev/null 2>&1 || log_error "node is required but not installed"
    command -v npm >/dev/null 2>&1 || log_error "npm is required but not installed"
    command -v pm2 >/dev/null 2>&1 || log_error "pm2 is required but not installed"
    
    log_info "All requirements satisfied"
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_DIR="${BACKUP_PATH}/${TIMESTAMP}"
    
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${BACKUP_DIR}"
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cp -r ${DEPLOY_PATH} ${BACKUP_DIR}/"
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mongodump --out ${BACKUP_DIR}/mongodb"
    
    log_info "Backup created at ${BACKUP_DIR}"
}

# Deploy application
deploy() {
    log_info "Starting deployment..."
    
    # Pull latest code
    log_info "Pulling latest code from ${BRANCH}..."
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH} && git fetch origin && git checkout ${BRANCH} && git pull origin ${BRANCH}"
    
    # Install dependencies
    log_info "Installing dependencies..."
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH} && npm ci --production"
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/server && npm ci --production"
    
    # Build frontend
    log_info "Building frontend..."
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH} && npm run build"
    
    # Run migrations
    log_info "Running database migrations..."
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH} && npm run migrate"
    
    # Restart services
    log_info "Restarting services..."
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "pm2 reload ${APP_NAME}"
    
    # Clear cache
    log_info "Clearing cache..."
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "redis-cli FLUSHDB"
    
    log_info "Deployment completed successfully!"
}

# Health check
health_check() {
    log_info "Running health check..."
    
    sleep 10
    
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${APP_NAME}.com/health)
    
    if [ $HEALTH_STATUS -eq 200 ]; then
        log_info "Health check passed"
    else
        log_error "Health check failed with status ${HEALTH_STATUS}"
    fi
}

# Rollback
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Get latest backup
    LATEST_BACKUP=$(ssh ${DEPLOY_USER}@${DEPLOY_HOST} "ls -t ${BACKUP_PATH} | head -1")
    
    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup found"
    fi
    
    log_info "Restoring from backup ${LATEST_BACKUP}..."
    
    # Restore files
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "rm -rf ${DEPLOY_PATH}/*"
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cp -r ${BACKUP_PATH}/${LATEST_BACKUP}/${APP_NAME}/* ${DEPLOY_PATH}/"
    
    # Restore database
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mongorestore --drop ${BACKUP_PATH}/${LATEST_BACKUP}/mongodb"
    
    # Restart services
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "pm2 reload ${APP_NAME}"
    
    log_info "Rollback completed"
}

# Main execution
main() {
    case "$1" in
        deploy)
            check_requirements
            create_backup
            deploy
            health_check
            ;;
        rollback)
            rollback
            health_check
            ;;
        backup)
            create_backup
            ;;
        health)
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|backup|health}"
            exit 1
            ;;
    esac
}

main "$@"