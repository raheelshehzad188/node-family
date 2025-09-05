#!/bin/bash

# GlamAI Admin Panel Backup Script
# Creates backups of database and uploaded files

set -e

# Configuration
BACKUP_DIR="/var/backups/glamai"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MONGO_HOST=${MONGO_HOST:-localhost}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_DB=${MONGO_DB:-glamai_admin}
UPLOADS_DIR="../backend/uploads"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Starting GlamAI backup process..."

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup MongoDB
echo "📊 Backing up MongoDB database..."
MONGO_BACKUP_DIR="${BACKUP_DIR}/mongodb_${TIMESTAMP}"
mkdir -p ${MONGO_BACKUP_DIR}

if command -v mongodump >/dev/null 2>&1; then
    mongodump --host ${MONGO_HOST}:${MONGO_PORT} --db ${MONGO_DB} --out ${MONGO_BACKUP_DIR}
    echo -e "${GREEN}✅ MongoDB backup completed${NC}"
else
    echo -e "${YELLOW}⚠️  mongodump not found, skipping database backup${NC}"
fi

# Backup uploaded files
echo "📁 Backing up uploaded files..."
UPLOADS_BACKUP="${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"

if [ -d "${UPLOADS_DIR}" ]; then
    tar -czf ${UPLOADS_BACKUP} -C ${UPLOADS_DIR} .
    echo -e "${GREEN}✅ Uploads backup completed${NC}"
else
    echo -e "${YELLOW}⚠️  Uploads directory not found${NC}"
fi

# Backup environment files
echo "🔧 Backing up configuration files..."
CONFIG_BACKUP="${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz"
tar -czf ${CONFIG_BACKUP} \
    ../backend/.env \
    ../frontend/.env \
    ../docker-compose.yml \
    2>/dev/null || true

# Create backup manifest
echo "📝 Creating backup manifest..."
cat > "${BACKUP_DIR}/backup_${TIMESTAMP}.manifest" <<EOF
Backup Timestamp: ${TIMESTAMP}
MongoDB Backup: ${MONGO_BACKUP_DIR}
Uploads Backup: ${UPLOADS_BACKUP}
Config Backup: ${CONFIG_BACKUP}
EOF

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find ${BACKUP_DIR} -type f -mtime +7 -delete
find ${BACKUP_DIR} -type d -empty -delete

# Show backup summary
echo ""
echo "✨ Backup completed successfully!"
echo "📍 Backup location: ${BACKUP_DIR}"
echo "🗄️  Database: ${MONGO_BACKUP_DIR}"
echo "📁 Uploads: ${UPLOADS_BACKUP}"
echo "🔧 Config: ${CONFIG_BACKUP}"

# Calculate backup size
BACKUP_SIZE=$(du -sh ${BACKUP_DIR} | cut -f1)
echo "💾 Total backup size: ${BACKUP_SIZE}"