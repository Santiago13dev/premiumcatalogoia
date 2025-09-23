#!/bin/bash

# Automated backup script

set -e

# Configuration
BACKUP_DIR="/var/backups/premiumcatalogoia"
MAX_BACKUPS=30
MONGODB_URI="mongodb://localhost:27017/premiumcatalogoia"
S3_BUCKET="premiumcatalogoia-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p ${BACKUP_DIR}/${TIMESTAMP}

echo "Starting backup at $(date)..."

# Backup MongoDB
echo "Backing up MongoDB..."
mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}/${TIMESTAMP}/mongodb" --quiet

# Backup uploaded files
echo "Backing up uploaded files..."
tar -czf "${BACKUP_DIR}/${TIMESTAMP}/uploads.tar.gz" -C /var/www/premiumcatalogoia uploads/ 2>/dev/null || true

# Backup environment files
echo "Backing up configuration..."
cp /var/www/premiumcatalogoia/.env "${BACKUP_DIR}/${TIMESTAMP}/"
cp /var/www/premiumcatalogoia/pm2.config.js "${BACKUP_DIR}/${TIMESTAMP}/"

# Create archive
echo "Creating archive..."
cd ${BACKUP_DIR}
tar -czf "${TIMESTAMP}.tar.gz" ${TIMESTAMP}/
rm -rf ${TIMESTAMP}/

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
    echo "Uploading to S3..."
    aws s3 cp "${BACKUP_DIR}/${TIMESTAMP}.tar.gz" "s3://${S3_BUCKET}/" --quiet
fi

# Cleanup old backups
echo "Cleaning up old backups..."
cd ${BACKUP_DIR}
ls -t *.tar.gz | tail -n +${MAX_BACKUPS} | xargs -r rm

# Log backup size
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${TIMESTAMP}.tar.gz" | cut -f1)
echo "Backup completed: ${TIMESTAMP}.tar.gz (${BACKUP_SIZE})"

# Send notification (optional)
if [ ! -z "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"Backup completed successfully: ${TIMESTAMP}.tar.gz (${BACKUP_SIZE})\"}" \
        $SLACK_WEBHOOK
fi