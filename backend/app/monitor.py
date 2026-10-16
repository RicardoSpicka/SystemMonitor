
import asyncio
import logging

from sqlalchemy import select

from app.api.routes.services import check_service
from app.database import SessionLocal
from app.models.service import MonitoredService

logger = logging.getLogger(__name__)

# Intervalo, em segundos, entre os ciclos de monitoramento.
CHECK_INTERVAL = 60


# Cria uma sessão própria para verificar um serviço e garante
# seu fechamento mesmo se ocorrer algum erro durante a verificação.
def check_service_in_session(service_id: int):
    db = SessionLocal()

    try:
        check_service(service_id=service_id, db=db)
    finally:
        db.close()


# Executa continuamente o monitoramento dos serviços ativos.
async def monitor_services():
    while True:
        db = SessionLocal()

        try:
            # Busca somente os IDs dos serviços ativos,
            # evitando carregar todos os dados de cada serviço.
            service_ids = db.scalars(
                select(MonitoredService.id).where(
                    MonitoredService.is_active.is_(True)
                )
            ).all()
        except Exception:
            logger.exception("Erro ao buscar serviços ativos")
            service_ids = []
        finally:
            db.close()

        # Executa cada verificação em uma thread separada para não
        # bloquear o ciclo assíncrono enquanto a operação é executada.
        for service_id in service_ids:
            try:
                await asyncio.to_thread(
                    check_service_in_session,
                    service_id,
                )
            except Exception:
                logger.exception(
                    "Erro ao verificar serviço ID %s",
                    service_id,
                )

        # Aguarda antes de iniciar o próximo ciclo de monitoramento.
        await asyncio.sleep(CHECK_INTERVAL)
