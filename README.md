
<div align="center">

# 🖥️ SystemMonitor

### Monitoramento de serviços web em tempo real

Acompanhe a disponibilidade, o tempo de resposta e o histórico dos seus serviços em uma única aplicação.

<br />

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## 📌 Sobre o projeto

O **SystemMonitor** é uma aplicação web desenvolvida para monitorar a disponibilidade e o desempenho de serviços web.

O sistema permite cadastrar serviços, consultar seus estados operacionais, acompanhar tempos de resposta e visualizar o histórico de verificações por meio de gráficos.

O projeto reúne conceitos de desenvolvimento frontend, APIs REST, persistência de dados, monitoramento automatizado e visualização de informações.

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| 📊 Dashboard | Visão geral dos serviços monitorados e de seus indicadores. |
| 🖥️ Gerenciamento | Cadastro, edição, listagem e exclusão de serviços. |
| 💚 Monitoramento | Acompanhamento da disponibilidade dos serviços. |
| ⚡ Tempo de resposta | Registro e visualização do tempo de resposta. |
| 📈 Gráficos | Visualização histórica dos tempos de resposta. |
| 🕒 Histórico | Consulta de verificações por serviço e período. |
| 🔄 Atualização automática | Atualização periódica dos dados apresentados no gráfico. |
| 🔌 API REST | Comunicação entre frontend e backend por meio de endpoints HTTP. |

## 🛠️ Tecnologias

<div align="center">

| Frontend | Backend | Banco de dados |
|:---:|:---:|:---:|
| ⚛️ React | 🐍 Python | 🗄️ SQLite |
| ⚡ Vite | 🚀 FastAPI | |
| 📊 Recharts | 🧩 SQLAlchemy | |
| 🎨 Lucide React | | |
| 🔗 Axios | | |

</div>

## 🏗️ Arquitetura

O projeto está organizado em duas aplicações integradas:

```text
SystemMonitor/
├── backend/
│   └── app/
│       ├── api/
│       │   └── routes/
│       ├── core/
│       ├── models/
│       ├── schemas/
│       ├── database.py
│       ├── main.py
│       └── monitor.py
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        ├── App.jsx
        └── App.css
```

> 📁 A estrutura é ilustrativa e deve ser ajustada caso os diretórios reais do projeto sejam diferentes.

### 🔄 Fluxo da aplicação

```text
👤 Usuário
    │
    ▼
🖥️ Frontend React
    │
    ▼
🔌 API REST — FastAPI
    │
    ├── 🔍 Monitoramento dos serviços
    │
    ▼
🗄️ SQLAlchemy + SQLite
    │
    ▼
📊 Histórico e indicadores
```

## 🚀 Como executar

### 📋 Pré-requisitos

- 🐍 Python instalado.
- 🟢 Node.js e npm instalados.
- 💻 Git instalado, caso queira clonar o repositório.

### 1️⃣ Backend — Python

Abra um terminal na pasta `backend`:

```bash
cd backend
```

Crie um ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual no Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Inicie a API:

```bash
uvicorn app.main:app --reload
```

A API estará disponível em:

- 🔌 **API:** http://127.0.0.1:8000
- 📚 **Swagger UI:** http://127.0.0.1:8000/docs
- 📖 **ReDoc:** http://127.0.0.1:8000/redoc

### 2️⃣ Frontend — React + Vite

Abra outro terminal na pasta `frontend`:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

Acesse a aplicação pelo endereço apresentado no terminal do Vite, normalmente:

**http://localhost:5173**

## 📈 Monitoramento e histórico

O SystemMonitor apresenta informações sobre o estado dos serviços e os tempos de resposta registrados.

O histórico pode ser consultado por serviço e período, enquanto o gráfico permite acompanhar a evolução dos tempos de resposta.

## 🗄️ Persistência de dados

O projeto utiliza SQLite para armazenar os dados da aplicação.

> 🔐 Bancos de dados locais, backups, arquivos de ambiente e credenciais não devem ser publicados no repositório sem uma necessidade explícita.

## 🗺️ Próximas melhorias

- [ ] 🧪 Implementar testes automatizados.
- [ ] ⚙️ Configurar a URL da API por variável de ambiente.
- [ ] 📊 Aprimorar os indicadores de disponibilidade.
- [ ] 🔒 Implementar autenticação e controle de acesso.
- [ ] 🚀 Preparar a aplicação para implantação em produção.

## 👨‍💻 Autor

Desenvolvido como projeto prático de estudo em desenvolvimento web, APIs REST, persistência de dados e monitoramento de serviços.

---

<div align="center">

**🖥️ SystemMonitor — Visibilidade e controle dos seus serviços.**

</div>
