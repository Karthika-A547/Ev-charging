import os

class Settings:
    PROJECT_NAME: str = "SmartCharge AI"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartcharge-ai-super-secret-jwt-key-2025-secure-hash")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartcharge.db")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    TRAFFIC_API_KEY: str = os.getenv("TRAFFIC_API_KEY", "")

settings = Settings()
