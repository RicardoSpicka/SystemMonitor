
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.check_history import CheckHistory
from app.models.service import MonitoredService


router = APIRouter(prefix="/services", tags=["History"])


# Consulta o histórico de um serviço, permitindo filtrar os registros por período.
@router.get("/{service_id}/history")
def get_service_history(
    service_id: int,
    period: str = Query(default="20"),
    db: Session = Depends(get_db),
):
    # Valida a existência do serviço antes de consultar seu histórico.
    service = db.get(MonitoredService, service_id)

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado",
        )

    query = select(CheckHistory).where(
        CheckHistory.service_id == service_id
    )

    # "20" retorna as 20 verificações mais recentes, em ordem cronológica.
    if period == "20":
        query = query.order_by(
            CheckHistory.checked_at.desc()
        ).limit(20)

    # Para períodos definidos por tempo, considera apenas registros
    # posteriores ao instante calculado a partir do horário atual.
    elif period in ("1h", "24h", "7d"):
        durations = {
            "1h": timedelta(hours=1),
            "24h": timedelta(hours=24),
            "7d": timedelta(days=7),
        }

        cutoff = datetime.now() - durations[period]

        query = query.where(
            CheckHistory.checked_at >= cutoff
        ).order_by(CheckHistory.checked_at.asc())

    # "all" retorna todo o histórico disponível em ordem cronológica.
    elif period == "all":
        query = query.order_by(
            CheckHistory.checked_at.asc()
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Período inválido. Use 20, 1h, 24h, 7d ou all.",
        )

    # Executa a consulta e carrega os registros encontrados.
    records = db.scalars(query).all()

    # A consulta das 20 últimas verificações foi feita em ordem decrescente.
    # Invertemos o resultado para exibi-lo do mais antigo ao mais recente.
    if period == "20":
        records = list(reversed(records))

    # Retorna apenas os campos necessários para o frontend.
    return [
        {
            "id": item.id,
            "service_id": item.service_id,
            "status": item.status,
            "http_status_code": item.http_status_code,
            "response_time": item.response_time,
            "checked_at": item.checked_at,
        }
        for item in records
    ]
