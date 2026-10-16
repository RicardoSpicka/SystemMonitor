
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# Define o caminho do banco SQLite a partir da localização deste arquivo,
# evitando depender da pasta em que o comando do backend é executado.
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'systemmonitor.db'}"

engine = create_engine(
    DATABASE_URL,
    # Permite utilizar a conexão SQLite em diferentes threads,
    # necessário para o funcionamento com FastAPI.
    connect_args={"check_same_thread": False},
)

# Define como as sessões de acesso ao banco serão criadas.
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


# Classe base dos modelos ORM; o SQLAlchemy usa seus metadados
# para identificar as tabelas que serão criadas.
class Base(DeclarativeBase):
    pass


# Dependência do FastAPI: fornece uma sessão para cada requisição
# que a utiliza e garante seu fechamento ao final.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
