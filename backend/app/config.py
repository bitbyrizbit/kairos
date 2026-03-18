"""
config.py
App settings loaded from .env — single source of truth for all config.
Using pydantic-settings here so we get type validation on env vars for free.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):

    # -- App --
    app_name: str = "KAIROS"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = False

    # -- API Keys --
    groq_api_key: str
    news_api_key: str

    # -- CORS --
    cors_origins: str = "http://localhost:3000"

    # -- Ripple Engine --
    max_ripple_hops: int = 6
    severity_decay: float = 0.25
    min_severity_threshold: float = 0.10
    compound_crisis_factor: float = 1.35

    # -- Kairos Index --
    elevated_threshold: int = 45
    critical_threshold: int = 65
    catastrophic_threshold: int = 80

    # -- News ingestion --
    news_fetch_interval_seconds: int = 1800
    max_articles_per_fetch: int = 50

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def get_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()