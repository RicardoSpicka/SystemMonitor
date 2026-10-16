
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# Armazena o histórico das verificações realizadas nos serviços.
class CheckHistory(Base):
    __tablename__ = "check_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Relaciona cada registro ao serviço monitorado correspondente.
    # ondelete="CASCADE" configura a exclusão em cascata no banco.
    service_id: Mapped[int] = mapped_column(
        ForeignKey("monitored_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    # Campos opcionais: podem não ter valor quando a verificação
    # não consegue obter uma resposta HTTP válida.
    http_status_code: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    response_time: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # Registra quando a verificação ocorreu; se não for informado,
    # utiliza o horário UTC no momento da inserção.
    checked_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
