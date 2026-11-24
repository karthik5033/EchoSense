from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    PROJECT_NAME: str = "EchoSense API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = "echosense-super-secure-production-secret-key-340ms-lead-time"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (Default to aiosqlite for zero-config local dev, override with PostgreSQL in production/docker)
    DATABASE_URL: str = "sqlite+aiosqlite:///./echosense.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19000",
        "http://localhost:19006",
        "exp://localhost:8081",
        "*"
    ]
    
    # Storage
    UPLOAD_DIR: str = "./storage/uploads"
    DATASET_DIR: str = "./storage/datasets"
    MODEL_DIR: str = "./storage/models"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
