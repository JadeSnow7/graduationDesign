#!/bin/sh
set -e

# =============================================================================
# EMField Teaching Platform - Entrypoint Script
# =============================================================================

echo "================================================"
echo "  EMField Teaching Platform - Starting..."
echo "================================================"

# -----------------------------------------------------------------------------
# Validate Required Environment Variables
# -----------------------------------------------------------------------------
if [ -z "$DB_DSN" ]; then
    echo "ERROR: DB_DSN environment variable is required"
    exit 1
fi

# -----------------------------------------------------------------------------
# Set Default AI Configuration
# -----------------------------------------------------------------------------
export AI_ENABLED="${AI_ENABLED:-true}"
export AI_BASE_URL="${AI_BASE_URL:-http://127.0.0.1:8001}"
export SIM_ENABLED="${SIM_ENABLED:-true}"
export SIM_BASE_URL="${SIM_BASE_URL:-http://127.0.0.1:8002}"

echo "Configuration:"
echo "  - AI Enabled: $AI_ENABLED"
echo "  - AI Base URL: $AI_BASE_URL"
echo "  - Sim Enabled: $SIM_ENABLED"
echo "  - Sim Base URL: $SIM_BASE_URL"
echo "  - MinIO Endpoint: ${MINIO_ENDPOINT:-<not configured>}"

# -----------------------------------------------------------------------------
# Optional: Run Database Migrations
# -----------------------------------------------------------------------------
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    # Add migration command here if needed
    # e.g., /app/backend migrate
fi

# -----------------------------------------------------------------------------
# Wait for External Dependencies
# -----------------------------------------------------------------------------
wait_for_service() {
    local host=$1
    local port=$2
    local max_attempts=$3
    local attempt=0
    
    echo "Waiting for $host:$port..."
    while ! nc -z "$host" "$port" 2>/dev/null; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            echo "WARNING: Could not connect to $host:$port after $max_attempts attempts"
            return 1
        fi
        sleep 2
    done
    echo "  $host:$port is ready"
    return 0
}

# Extract host:port from DB_DSN (simplified, assumes tcp(host:port) format)
if echo "$DB_DSN" | grep -q "tcp("; then
    DB_HOST=$(echo "$DB_DSN" | sed -n 's/.*tcp(\([^:]*\):\([^)]*\)).*/\1/p')
    DB_PORT=$(echo "$DB_DSN" | sed -n 's/.*tcp(\([^:]*\):\([^)]*\)).*/\2/p')
    if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
        wait_for_service "$DB_HOST" "$DB_PORT" 30 || echo "Continuing anyway..."
    fi
fi

# -----------------------------------------------------------------------------
# Start Supervisord (exec for proper signal handling)
# -----------------------------------------------------------------------------
echo ""
echo "Starting services via supervisord..."
echo "================================================"

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
