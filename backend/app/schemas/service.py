
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


# Valida os dados necessários para cadastrar um serviço.
class ServiceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    url: HttpUrl


# Define os dados aceitos ao atualizar um serviço existente.
class ServiceUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    url: HttpUrl


# Define os campos e tipos retornados pela API ao consultar um serviço.
class ServiceResponse(BaseModel):
    id: int
    name: str
    url: str
    is_active: bool
    last_status: str
    last_response_time: int | None
    last_checked_at: datetime | None

    # Permite criar a resposta a partir dos atributos de um objeto,
    # como uma instância do modelo SQLAlchemy.
    model_config = ConfigDict(from_attributes=True)
