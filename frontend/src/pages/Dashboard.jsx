
import ResponseTimeChart from "../components/ResponseTimeChart";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";
import "../App.css";

function Dashboard() {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("2");
  const [chartRefreshKey, setChartRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingId, setCheckingId] = useState(null);
  const [error, setError] = useState("");

  // Carrega os serviços e mantém a seleção do gráfico válida
  // mesmo quando um serviço é excluído ou a lista muda.
  const loadServices = useCallback(async () => {
    try {
      const response = await api.get("/services");
      setServices(response.data);

      setSelectedServiceId((currentId) => {
        const exists = response.data.some(
          (service) => String(service.id) === currentId
        );

        return exists
          ? currentId
          : response.data.length > 0
            ? String(response.data[0].id)
            : "";
      });

      setError("");
    } catch {
      setError("Não foi possível conectar à API Python.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Executa uma verificação manual e atualiza a lista e o gráfico.
  async function checkService(id) {
    setCheckingId(id);
    setError("");

    try {
      await api.post(`/services/${id}/check`);
      await loadServices();

      if (String(id) === selectedServiceId) {
        setChartRefreshKey((current) => current + 1);
      }
    } catch {
      setError("Falha ao verificar o serviço.");
    } finally {
      setCheckingId(null);
    }
  }

  // Calcula os indicadores do dashboard com base no último estado
  // conhecido de cada serviço.
  const online = services.filter(
    (service) => service.last_status === "ONLINE"
  ).length;

  const offline = services.filter(
    (service) => ["OFFLINE", "ERROR"].includes(service.last_status)
  ).length;

  const responseTimes = services
    .filter((service) => service.last_response_time != null)
    .map((service) => service.last_response_time);

  const average = responseTimes.length
    ? Math.round(
        responseTimes.reduce((sum, value) => sum + value, 0) /
          responseTimes.length
      )
    : 0;

  // Interpreta os horários recebidos da API como UTC quando
  // não contêm indicação de fuso, exibindo-os no horário local.
  const formatDate = (value) => {
    if (!value) return "Ainda não verificado";

    return new Date(
      value.endsWith("Z") ? value : `${value}Z`
    ).toLocaleString("pt-BR");
  };

  return (
    <div className="app-shell">
      <div className="dashboard-content">
        {/* Cabeçalho e ação de atualização da lista. */}
        <header className="topbar">
          <div>
            <span className="eyebrow">MONITORAMENTO</span>
            <h1>Dashboard</h1>
            <p>Acompanhe a saúde dos seus serviços.</p>
          </div>

          <button
            className="button secondary"
            onClick={loadServices}
            disabled={loading}
          >
            <RefreshCw size={17} /> Atualizar
          </button>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {/* Indicadores calculados a partir dos serviços carregados. */}
        <section className="metrics">
          <article className="metric-card">
            <div className="metric-icon blue"><Server size={22} /></div>
            <span>Serviços monitorados</span>
            <strong>{services.length}</strong>
            <small>Total cadastrado</small>
          </article>

          <article className="metric-card">
            <div className="metric-icon green"><CheckCircle2 size={22} /></div>
            <span>Serviços online</span>
            <strong>{online}</strong>
            <small>Respondendo normalmente</small>
          </article>

          <article className="metric-card">
            <div className="metric-icon red"><CircleAlert size={22} /></div>
            <span>Serviços com falha</span>
            <strong>{offline}</strong>
            <small>Offline ou erro HTTP</small>
          </article>

          <article className="metric-card">
            <div className="metric-icon purple"><Clock3 size={22} /></div>
            <span>Resposta média</span>
            <strong>{average} <small>ms</small></strong>
            <small>Últimas verificações conhecidas</small>
          </article>
        </section>

        {/* Tabela com o estado atual e a verificação manual de cada serviço. */}
        <section className="section-heading">
          <div>
            <h2>Serviços monitorados</h2>
            <p>Dados carregados da API em Python.</p>
          </div>
          <span className="service-count">
            {services.length} serviço(s)
          </span>
        </section>

        <section className="table-card">
          {loading ? (
            <div className="empty-state">Carregando serviços...</div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              Nenhum serviço cadastrado. Cadastre um pela API Swagger.
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th>Status</th>
                    <th>Resposta</th>
                    <th>Última verificação</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <div className="service-name">
                          <div className="service-icon">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <strong>{service.name}</strong>
                            <span>{service.url}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status ${
                          service.last_status === "ONLINE"
                            ? "online"
                            : service.last_status === "PENDING"
                              ? "pending"
                              : "offline"
                        }`}>
                          {service.last_status === "ONLINE"
                            ? "Online"
                            : service.last_status === "PENDING"
                              ? "Pendente"
                              : service.last_status === "ERROR"
                                ? "Erro HTTP"
                                : "Offline"}
                        </span>
                      </td>
                      <td>
                        {service.last_response_time == null
                          ? "—"
                          : `${service.last_response_time} ms`}
                      </td>
                      <td>{formatDate(service.last_checked_at)}</td>
                      <td>
                        <button
                          className="button check-button"
                          onClick={() => checkService(service.id)}
                          disabled={checkingId !== null}
                        >
                          <RefreshCw size={15} />
                          {checkingId === service.id
                            ? "Verificando"
                            : "Verificar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Gráfico do histórico do serviço selecionado. */}
        <section className="chart-card">
          <div className="section-heading">
            <div>
              <h2>Tempo de resposta</h2>
              <p>Histórico das verificações do serviço selecionado.</p>
            </div>

            <select
              className="service-select"
              value={selectedServiceId}
              onChange={(event) =>
                setSelectedServiceId(event.target.value)
              }
              disabled={services.length === 0}
            >
              {services.map((service) => (
                <option key={service.id} value={String(service.id)}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {selectedServiceId ? (
            <ResponseTimeChart
              serviceId={Number(selectedServiceId)}
              refreshKey={chartRefreshKey}
            />
          ) : (
            <p>Nenhum serviço cadastrado.</p>
          )}
        </section>

        <footer className="page-footer">
          <span><span className="pulse" /> SystemMonitor operacional</span>
          <span>React + FastAPI</span>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
