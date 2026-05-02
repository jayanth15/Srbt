from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "SRBT API"
    debug: bool = False
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24h

    # Database — set DATABASE_URL to postgres:// for prod, leave blank for SQLite dev
    database_url: str = "sqlite+aiosqlite:///./srbt_dev.db"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "https://app.srbt.in"]


settings = Settings()
