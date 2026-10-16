
import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

import api from "../services/api";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);

  async function loadServices() {
    try {
      const response = await api.get("/services");
      setServices(response.data);
      setError("");
    } catch {
      setError("Não foi possível carregar os serviços da API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  function resetForm() {
    setName("");
    setUrl("");
    setEditingService(null);
    setShowForm(false);
  }

  function openNewServiceForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(service) {
    setEditingService(service);
    setName(service.name);
    setUrl(service.url);
    setShowForm(true);
  }

  function formatDate(value) {
    if (!value) return "Ainda não verificado";

    return new Date(
      value.endsWith("Z") ? value : `${value}Z`
    ).toLocaleString("pt-BR");
  }

  function getStatus(service) {
    if (service.last_status === "ONLINE") {
      return { label: "Online", className: "online" };
    }

    if (service.last_status === "PENDING") {
      return { label: "Pendente", className: "pending" };
    }

    if (service.last_status === "ERROR") {
      return { label: "Erro HTTP", className: "offline" };
    }

    return { label: "Offline", className: "offline" };
  }

  async function createService(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await api.post("/services", { name, url });
      resetForm();
      await loadServices();
    } catch {
      setError(
        "Não foi possível cadastrar o serviço. Confira os dados e tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateService(event) {
    event.preventDefault();

    if (!editingService) return;

    setSaving(true);
    setError("");

    try {
      await api.put(`/services/${editingService.id}`, { name, url });
      resetForm();
      await loadServices();
    } catch {
      setError(
        "Não foi possível atualizar o serviço. Confira os dados e tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(service) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o serviço "${service.name}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(`/services/${service.id}`);
      await loadServices();
    } catch {
      setError("Não foi possível excluir o serviço.");
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">GERENCIAMENTO</span>
          <h1>Serviços</h1>
          <p>Consulte os serviços cadastrados no SystemMonitor.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="button secondary"
            type="button"
            onClick={openNewServiceForm}
          >
            + Novo serviço
          </button>

          <button
            className="button secondary"
            type="button"
            onClick={loadServices}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Atualizar
          </button>
        </div>
      </header>

      {showForm && (
        <section
          className="table-card"
          style={{ padding: "24px", marginTop: "24px" }}
        >
          <h2>{editingService ? "Editar serviço" : "Novo serviço"}</h2>

          <form
            onSubmit={editingService ? updateService : createService}
            style={{
              display: "grid",
              gap: "16px",
              maxWidth: "500px",
            }}
          >
            <label>
              Nome do serviço
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Ex.: Servidor de produção"
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "8px",
                  padding: "10px",
                }}
              />
            </label>

            <label>
              URL
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
                placeholder="https://exemplo.com"
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "8px",
                  padding: "10px",
                }}
              />
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="button secondary"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Salvando..."
                  : editingService
                    ? "Salvar alterações"
                    : "Salvar serviço"}
              </button>

              <button
                className="button secondary"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {error && <div className="error-banner">{error}</div>}

      <section className="section-heading">
        <div>
          <h2>Serviços cadastrados</h2>
          <p>Estado atual e última verificação de cada serviço.</p>
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
            Nenhum serviço cadastrado.
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Status</th>
                  <th>Tempo de resposta</th>
                  <th>Última verificação</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => {
                  const status = getStatus(service);

                  return (
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
                        <span className={`status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      <td>
                        {service.last_response_time == null
                          ? "—"
                          : `${service.last_response_time} ms`}
                      </td>

                      <td>{formatDate(service.last_checked_at)}</td>

                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="button secondary"
                            type="button"
                            onClick={() => openEditForm(service)}
                          >
                            Editar
                          </button>

                          <button
                            className="button secondary"
                            type="button"
                            onClick={() => deleteService(service)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default Services;
