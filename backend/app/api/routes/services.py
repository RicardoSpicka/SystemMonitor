
from datetime import datetime, timezone
from time import perf_counter

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.check_history import CheckHistory
from app.models.service import MonitoredService
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate


router = APIRouter(prefix="/services", tags=["Services"])


# Cadastra um serviço e retorna os dados do registro criado.
@router.post(
    "",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
):
    service = MonitoredService(
        name=data.name,
        url=str(data.url),
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


# Atualiza os dados de um serviço existente.
@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
):
    service = db.get(MonitoredService, service_id)

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado",
        )

    service.name = data.name
    service.url = str(data.url)

    db.commit()
    db.refresh(service)

    return service


# Exclui o histórico associado antes de remover o serviço,
# evitando que registros antigos permaneçam vinculados ao mesmo ID.
@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
):
    service = db.get(MonitoredService, service_id)

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado",
        )

    db.query(CheckHistory).filter(
        CheckHistory.service_id == service_id
    ).delete(synchronize_session=False)

    db.delete(service)
    db.commit()

    return {"message": "Serviço excluído com sucesso"}


# Lista os serviços cadastrados, ordenados pelo identificador.
@router.get("", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    return db.scalars(
        select(MonitoredService).order_by(MonitoredService.id)
    ).all()


# Executa uma verificação HTTP imediata e registra o resultado
# tanto no serviço quanto na tabela de histórico.
@router.post("/{service_id}/check", response_model=ServiceResponse)
def check_service(
    service_id: int,
    db: Session = Depends(get_db),
):
    service = db.get(MonitoredService, service_id)

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado",
        )

    # Usa um contador monotônico para medir a duração da requisição,
    # sem depender de alterações no relógio do sistema.
    started = perf_counter()
    http_status_code = None
    response_time = None

    try:
        with httpx.Client(
            timeout=5.0,
            follow_redirects=True,
        ) as client:
            response = client.get(service.url)

        response_time = round((perf_counter() - started) * 1000)
        http_status_code = response.status_code

        # Considera sucesso os códigos HTTP da faixa 2xx.
        result_status = (
            "ONLINE" if response.is_success else "ERROR"
        )

    except httpx.HTTPError:
        # Falhas de conexão, timeout e outros erros HTTP
        # são registrados como indisponibilidade.
        result_status = "OFFLINE"

    # Armazena o horário em UTC sem informação explícita de fuso,
    # mantendo o formato esperado pelo modelo atual.
    checked_at = datetime.now(timezone.utc).replace(tzinfo=None)

    # Atualiza os campos que representam o último resultado conhecido.
    service.last_status = result_status
    service.last_response_time = response_time
    service.last_checked_at = checked_at

    # Cria um registro independente para preservar o histórico da verificação.
    history = CheckHistory(
        service_id=service.id,
        status=result_status,
        http_status_code=http_status_code,
        response_time=response_time,
        checked_at=checked_at,
    )

    db.add(history)
    db.commit()
    db.refresh(service)

    return service
