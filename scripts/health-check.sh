#!/bin/bash

# Health check script

set -e

# Configuration
APP_URL="https://premiumcatalogoia.com"
MAX_RETRIES=3
TIMEOUT=10
ALERT_EMAIL="admin@premiumcatalogoia.com"
SLACK_WEBHOOK=""

# Functions
send_alert() {
    local message=$1
    
    # Send email
    if command -v mail &> /dev/null && [ ! -z "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "[ALERT] Premium Catalog IA Health Check Failed" $ALERT_EMAIL
    fi
    
    # Send to Slack
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Health Check Alert: $message\"}" \
            $SLACK_WEBHOOK
    fi
}

check_service() {
    local service_name=$1
    local check_url=$2
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$check_url" || echo "000")
        
        if [ "$response" = "200" ]; then
            echo "✓ $service_name is healthy"
            return 0
        fi
        
        retries=$((retries + 1))
        sleep 5
    done
    
    echo "✗ $service_name is unhealthy (HTTP $response)"
    send_alert "$service_name health check failed with HTTP $response"
    return 1
}

# Main health checks
echo "Running health checks at $(date)..."

# Check main application
check_service "Application" "${APP_URL}/health"

# Check database
check_service "Database" "${APP_URL}/health/database"

# Check Redis
check_service "Redis" "${APP_URL}/health/redis"

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠ Warning: Disk usage is ${DISK_USAGE}%"
    send_alert "Disk usage is at ${DISK_USAGE}%"
fi

# Check memory
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "⚠ Warning: Memory usage is ${MEM_USAGE}%"
    send_alert "Memory usage is at ${MEM_USAGE}%"
fi

# Check PM2 processes
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list | grep premiumcatalogoia | grep online | wc -l)
    if [ $PM2_STATUS -eq 0 ]; then
        echo "✗ PM2 process is not running"
        send_alert "PM2 process for premiumcatalogoia is not running"
        
        # Try to restart
        echo "Attempting to restart PM2 process..."
        pm2 restart premiumcatalogoia
    else
        echo "✓ PM2 process is running"
    fi
fi

echo "Health checks completed at $(date)"