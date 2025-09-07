# Rapid Video Backend Dockerfile
# Multi-stage build for optimized production image

# =============================================================================
# Build Stage
# =============================================================================
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --user --no-cache-dir -r requirements.txt

# =============================================================================
# Production Stage
# =============================================================================
FROM python:3.11-slim as production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/root/.local/bin:$PATH \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # FFmpeg for video processing
    ffmpeg \
    # Image processing libraries
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # Network tools
    curl \
    # Clean up
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r rapidvideo && useradd -r -g rapidvideo rapidvideo

# Create application directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/storage/uploads \
    && mkdir -p /app/storage/outputs \
    && mkdir -p /app/storage/temp \
    && mkdir -p /app/logs

# Set ownership and permissions
RUN chown -R rapidvideo:rapidvideo /app \
    && chmod -R 755 /app

# Switch to non-root user
USER rapidvideo

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

# =============================================================================
# Development Stage (optional)
# =============================================================================
FROM production as development

# Switch back to root for development tools
USER root

# Install development dependencies
RUN pip install --no-cache-dir \
    pytest \
    pytest-asyncio \
    pytest-cov \
    black \
    flake8 \
    mypy \
    pre-commit

# Install additional development tools
RUN apt-get update && apt-get install -y \
    git \
    vim \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Switch back to app user
USER rapidvideo

# Development command with auto-reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]

# =============================================================================
# Build Instructions
# =============================================================================
#
# Build for production:
# docker build --target production -t rapid-video-backend .
#
# Build for development:
# docker build --target development -t rapid-video-backend-dev .
#
# Run production container:
# docker run -p 8000:8000 --env-file .env rapid-video-backend
#
# Run development container:
# docker run -p 8000:8000 -v $(pwd):/app --env-file .env rapid-video-backend-dev
#
# =============================================================================

# =============================================================================
# Environment Variables for Render Deployment
# =============================================================================
#
# Set these in your Render service environment:
#
# ENVIRONMENT=production
# DATABASE_URL=postgresql://... (provided by Render)
# GEMINI_API_KEY=your-gemini-key
# VEO_API_KEY=your-veo-key
# BANANA_API_KEY=your-banana-key
# GOOGLE_CLOUD_PROJECT=your-project-id
# USE_CLOUD_STORAGE=true
# GCS_BUCKET_NAME=your-bucket-name
# SECRET_KEY=your-secure-secret-key
# ALLOWED_ORIGINS=https://your-frontend-url.github.io
#
# =============================================================================

# =============================================================================
# Render Deploy Configuration
# =============================================================================
#
# 1. Connect your GitHub repository to Render
# 2. Create a new Web Service
# 3. Set the following:
#    - Environment: Docker
#    - Build Command: (leave empty, uses Dockerfile)
#    - Start Command: (leave empty, uses CMD from Dockerfile)
#    - Port: 8000
# 4. Add environment variables in Render dashboard
# 5. Deploy!
#
# =============================================================================