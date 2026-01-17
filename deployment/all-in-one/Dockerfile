# All-in-One Docker Image for EMField Teaching Platform
# Contains: Go Backend + AI Service (Python/FastAPI)

# =============================================================================
# Stage 1: Build Go Backend
# =============================================================================
FROM golang:1.24-alpine AS go-builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files first for layer caching
COPY code/backend/go.mod code/backend/go.sum ./
RUN go mod download

# Copy source and build
COPY code/backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server

# =============================================================================
# Stage 2: Build Python AI Service dependencies
# =============================================================================
FROM python:3.11-slim AS python-builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY code/ai_service/requirements.txt ./requirements-ai.txt
COPY code/simulation/requirements.txt ./requirements-sim.txt
RUN pip install --no-cache-dir --target=/deps -r requirements-ai.txt -r requirements-sim.txt

# =============================================================================
# Stage 3: Final Runtime Image
# =============================================================================
FROM python:3.11-slim

# Install supervisor and runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    curl \
    ca-certificates \
    libfreetype6 \
    libpng16-16 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app appuser

WORKDIR /app

# Copy Go binary
COPY --from=go-builder /app/server /app/backend

# Copy Python dependencies and AI + Simulation services
COPY --from=python-builder /deps /usr/local/lib/python3.11/site-packages
COPY code/ai_service /app/ai_service
COPY code/simulation /app/simulation

# Copy configuration files
COPY deployment/all-in-one/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deployment/all-in-one/entrypoint.sh /app/entrypoint.sh

# Make scripts executable
RUN chmod +x /app/entrypoint.sh /app/backend

# Create log directory
RUN mkdir -p /var/log/supervisor && chown -R appuser:appgroup /var/log/supervisor

# Change ownership
RUN chown -R appuser:appgroup /app

# Environment variables with defaults
ENV DB_DSN="" \
    JWT_SECRET="change-me-in-production" \
    CORS_ORIGINS="*" \
    AI_BASE_URL="http://127.0.0.1:8001" \
    AI_ENABLED="true" \
    SIM_BASE_URL="http://127.0.0.1:8002" \
    SIM_ENABLED="true" \
    LLM_BASE_URL="" \
    LLM_API_KEY="" \
    LLM_MODEL="gpt-4o-mini" \
    MINIO_ENDPOINT="" \
    MINIO_ACCESS_KEY="" \
    MINIO_SECRET_KEY="" \
    MINIO_BUCKET="emfield-uploads" \
    MPLBACKEND="Agg"

# Expose only the backend port (AI is internal)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/healthz || exit 1

# Run as non-root user
USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]
