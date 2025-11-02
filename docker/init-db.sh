#!/bin/bash
# Only copy .up.sql files for database initialization

# Copy up migration files only
cp /migration-source/*up.sql /docker-entrypoint-initdb.d/ 2>/dev/null || true