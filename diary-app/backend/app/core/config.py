import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = Field(...)
    SECRET_KEY: str = Field(...)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8080
    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"]
    )

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # env_file은 SettingsConfigDict에서 고정할 수 없기 때문에,
    # APP_ENV에 따라 load_dotenv로 환경변수를 먼저 주입한 뒤 BaseSettings를 사용합니다.
    model_config = SettingsConfigDict()

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> Any:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


APP_ENV = os.getenv("APP_ENV", "production").strip().lower()

backend_root = Path(__file__).resolve().parents[2]
env_filename_map = {
    "production": ".env.prod",
    "development": ".env.dev",
}
env_file = backend_root / env_filename_map.get(APP_ENV, ".env")

# APP_ENV에 맞는 파일을 먼저 로드하고, 이후 BaseSettings가 환경변수로부터 값을 읽습니다.
load_dotenv(dotenv_path=env_file, override=False)

settings = Settings()
