#!/usr/bin/env bash
# Nightly backup of the database and uploaded photos; keeps the last 14 days.
# Installed by DEPLOY.md step 8 (runs from the "nova" user's crontab).
set -euo pipefail

BACKUP_DIR=/home/nova/backups
APP_DIR=/opt/nova-habitation-backend
KEEP_DAYS=14
STAMP=$(date +%Y-%m-%d_%H%M)

mkdir -p "$BACKUP_DIR"

# Database credentials are read from the backend .env
set -a; source "$APP_DIR/.env"; set +a
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -Fc "$DB_NAME" \
  > "$BACKUP_DIR/db_$STAMP.dump"

tar -czf "$BACKUP_DIR/uploads_$STAMP.tar.gz" -C "$APP_DIR" uploads

find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete
