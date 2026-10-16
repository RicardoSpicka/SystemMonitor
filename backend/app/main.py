
from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.monitor import monitor_services
from app.api.routes.services import router as services_router
from app.api.routes.history import router as history_router
from app.core.config import settings
from app.database import Base, engine
from app.models.service import MonitoredService  # noqa: F401
from app.models.check_history import CheckHistory  # noqa: F401


# Gerencia a inicialização e o encerramento dos recursos da aplicação.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Garante que as tabelas dos modelos registrados existam no banco.
    Base.metadata.create_all(bind=engine)

    # Executa o monitoramento periódico em segundo plano.
    monitor_task = asyncio.create_task(monitor_services())

    try:
        yield
    finally:
        # Encerra a tarefa de monitoramento junto com a aplicação.
        monitor_task.cancel()

        try:
            await monitor_task
        except asyncio.CancelledError:
            pass


# Configuração principal da API.
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API de monitoramento de serviços.",
    lifespan=lifespan,
)

# Permite que o frontend acesse a API conforme as origens configuradas.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


# Endpoint para verificar a disponibilidade da API.
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "application": settings.app_name,
        "version": settings.app_version,
    }


# Endpoint raiz com informações básicas sobre a API.
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "SystemMonitor API",
        "documentation": "/docs",
    }


# Registra os endpoints de gerenciamento dos serviços monitorados.
app.include_router(
    services_router,
    prefix=settings.api_prefix,
)

# Registra os endpoints de consulta do histórico de verificações.
app.include_router(
    history_router,
    prefix=settings.api_prefix,
)
