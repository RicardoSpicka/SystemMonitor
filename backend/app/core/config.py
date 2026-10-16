
from pydantic_settings import BaseSettings, SettingsConfigDict


# Centraliza as configurações da aplicação, permitindo definir valores
# padrão e sobrescrevê-los por variáveis de ambiente.
class Settings(BaseSettings):
    app_name: str = "SystemMonitor"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"
    frontend_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Converte a lista de origens configurada como texto em uma lista
    # adequada ao middleware CORS. Permite informar várias origens separadas por vírgula.
    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        ]


# Cria a instância compartilhada das configurações da aplicação.
settings = Settings()
