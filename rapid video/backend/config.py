import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App Configuration
    APP_NAME: str = "Rapid Video API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./rapid_video.db"
    
    # Redis Configuration (for production)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Google Cloud Configuration
    GOOGLE_CLOUD_PROJECT: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    
    # Google AI API Keys
    GEMINI_API_KEY: Optional[str] = None
    VERTEX_AI_PROJECT: Optional[str] = None
    VERTEX_AI_LOCATION: str = "us-central1"
    
    # Veo 3 Configuration
    VEO_API_KEY: Optional[str] = None
    VEO_API_URL: str = "https://api.veo.ai/v1"
    
    # Banana.dev Configuration
    BANANA_API_KEY: Optional[str] = None
    BANANA_MODEL_KEY: Optional[str] = None
    
    # Storage Configuration
    USE_CLOUD_STORAGE: bool = False
    GCS_BUCKET_NAME: Optional[str] = None
    
    # File Upload Limits
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    MAX_VIDEO_DURATION: int = 180  # 3 minutes in seconds
    
    # Processing Configuration
    SCENE_DURATION: int = 8  # seconds per scene
    MAX_CONCURRENT_JOBS: int = 5
    
    # FFmpeg Configuration
    FFMPEG_PATH: str = "ffmpeg"
    FFPROBE_PATH: str = "ffprobe"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://your-github-pages-url.github.io"
    ]
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # AI Model Configuration
    GEMINI_MODEL: str = "gemini-1.5-pro"
    GEMINI_TEMPERATURE: float = 0.7
    GEMINI_MAX_TOKENS: int = 2048
    
    # Video Processing Configuration
    OUTPUT_VIDEO_CODEC: str = "libx264"
    OUTPUT_VIDEO_BITRATE: str = "2M"
    OUTPUT_AUDIO_CODEC: str = "aac"
    OUTPUT_AUDIO_BITRATE: str = "128k"
    
    # Webhook Configuration (optional)
    WEBHOOK_URL: Optional[str] = None
    WEBHOOK_SECRET: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Environment-specific configurations
if os.getenv("ENVIRONMENT") == "production":
    settings.DEBUG = False
    settings.USE_CLOUD_STORAGE = True
    settings.LOG_LEVEL = "WARNING"
elif os.getenv("ENVIRONMENT") == "development":
    settings.DEBUG = True
    settings.LOG_LEVEL = "DEBUG"
else:
    # Default to development settings
    settings.DEBUG = True
    settings.LOG_LEVEL = "INFO"

# Validate required settings
def validate_settings():
    """Validate that required settings are present"""
    required_for_ai = [
        "GEMINI_API_KEY",
        "VERTEX_AI_PROJECT"
    ]
    
    missing_settings = []
    
    for setting in required_for_ai:
        if not getattr(settings, setting):
            missing_settings.append(setting)
    
    if missing_settings:
        print(f"Warning: Missing required AI settings: {', '.join(missing_settings)}")
        print("Some AI features may not work properly.")
    
    # Validate cloud storage settings if enabled
    if settings.USE_CLOUD_STORAGE:
        if not settings.GCS_BUCKET_NAME:
            print("Warning: Cloud storage enabled but GCS_BUCKET_NAME not set")
        if not settings.GOOGLE_APPLICATION_CREDENTIALS:
            print("Warning: Cloud storage enabled but GOOGLE_APPLICATION_CREDENTIALS not set")

# Run validation
validate_settings()