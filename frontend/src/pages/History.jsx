
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import api from "../services/api";
import ResponseTimeChart from "../components/ResponseTimeChart";
import "../App.css";

function History() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [period, setPeriod] = useState("24h");

  // Carrega os serviços disponíveis e seleciona o primeiro por padrão.
  useEffect(() => {
    async function loadServices() {
      try {
        const response = await api.get("/services");
        setServices(response.data);

        if (response.data.length > 0) {
          setServiceId(String(response.data[0].id));
        }
      } catch {
        setError("Não foi possível carregar os serviços.");
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  // Atualiza o histórico quando o serviço ou o período selecionado muda.
  useEffect(() => {
    if (!serviceId) {
      setHistory([]);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);

      try {
        const response = await api.get(
          `/services/${serviceId}/history`,
          { params: { period } }
        );

        if (!cancelled) {
          setHistory(response.data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setHistory([]);
          setError("Não foi possível carregar o histórico.");
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    // Evita atualizar o estado se o efeito anterior já foi substituído.
    return () => {
      cancelled = true;
    };
  }, [serviceId, period]);

  const selectedService = services.find(
    (service) => String(service.id) === serviceId
  );

  // Os indicadores são calculados com base nos registros retornados
  // pela API para o serviço e o período selecionados.
  const totalChecks = history.length;

  const successfulChecks = history.filter(
    (item) => item.status === "ONLINE"
  ).length;

  const availability =
    totalChecks > 0
      ? (successfulChecks / totalChecks) * 100
      : null;

  const validResponseTimes = history
    .map((item) => item.response_time)
    .filter((value) => value !== null && value !== undefined);

  const averageResponseTime =
    validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, value) => sum + value, 0) /
        validResponseTimes.length
      : null;

  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">MONITORAMENTO</span>
          <h1>Histórico</h1>
          <p>Consulte o tempo de resposta dos serviços monitorados.</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="section-heading">
        <div>
          <h2>Histórico de resposta</h2>
          <p>Selecione um serviço para visualizar suas verificações.</p>
        </div>
      </section>

      <section className="table-card" style={{ padding: "24px" }}>
        {loading ? (
          <p>Carregando serviços...</p>
        ) : services.length === 0 ? (
          <p>Nenhum serviço cadastrado.</p>
        ) : (
          <>
            <label
              htmlFor="history-service"
              style={{ display: "block", marginBottom: "10px" }}
            >
              Serviço monitorado
            </label>

            <select
              id="history-service"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              style={{
                width: "100%",
                maxWidth: "450px",
                padding: "12px",
                marginBottom: "28px",
                borderRadius: "8px",
              }}
            >
              {services.map((service) => (
                <option key={service.id} value={String(service.id)}>
                  {service.name} — {service.url}
                </option>
              ))}
            </select>

            <label
              htmlFor="history-period"
              style={{ display: "block", marginBottom: "10px" }}
            >
              Período do histórico
            </label>

            <select
              id="history-period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={{
                width: "100%",
                maxWidth: "450px",
                padding: "12px",
                marginBottom: "28px",
                borderRadius: "8px",
              }}
            >
              <option value="20">Últimas 20 verificações</option>
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="all">Todo o histórico</option>
            </select>

            {selectedService && (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <h3>{selectedService.name}</h3>
                  <p>{selectedService.url}</p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "28px",
                  }}
                >
                  <div
                    className="table-card"
                    style={{
                      padding: "20px",
                      borderTop: "3px solid #34D399",
                      background: "#12251F",
                    }}
                  >
                    <p>Disponibilidade</p>
                    <h2 style={{ color: "#34D399" }}>
                      {historyLoading
                        ? "..."
                        : availability === null
                          ? "—"
                          : `${availability.toFixed(1)}%`}
                    </h2>
                    <small>{totalChecks} verificações analisadas</small>
                  </div>

                  <div
                    className="table-card"
                    style={{
                      padding: "20px",
                      borderTop: "3px solid #60A5FA",
                      background: "#142238",
                    }}
                  >
                    <p>Tempo médio de resposta</p>
                    <h2 style={{ color: "#60A5FA" }}>
                      {historyLoading
                        ? "..."
                        : averageResponseTime === null
                          ? "—"
                          : `${Math.round(averageResponseTime)} ms`}
                    </h2>
                    <small>Somente respostas com tempo válido</small>
                  </div>

                  <div
                    className="table-card"
                    style={{
                      padding: "20px",
                      borderTop: "3px solid #C084FC",
                      background: "#211A35",
                    }}
                  >
                    <p>Total de verificações</p>
                    <h2 style={{ color: "#C084FC" }}>
                      {historyLoading ? "..." : totalChecks}
                    </h2>
                    <small>Registros retornados pela API</small>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <Activity size={20} />
                  <h3>Tempo de resposta</h3>
                </div>

                <ResponseTimeChart
                  serviceId={selectedService.id}
                  period={period}
                />
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default History;
