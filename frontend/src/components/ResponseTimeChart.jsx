
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import api from "../services/api";

export default function ResponseTimeChart({
  serviceId,
  period = "20",
  refreshKey,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Carrega o histórico quando o serviço, o período ou a atualização mudam.
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);

      try {
        const response = await api.get(
          `/services/${serviceId}/history`,
          { params: { period } }
        );

        const formattedData = response.data
          .filter((item) => item.response_time != null)
          .map((item) => {
            const checkedAt = new Date(
              item.checked_at.endsWith("Z")
                ? item.checked_at
                : `${item.checked_at}Z`
            );

            return {
              timestamp: checkedAt.getTime(),
              responseTime: item.response_time,
            };
          })
          .sort((a, b) => a.timestamp - b.timestamp);

        if (!cancelled) {
          setHistory(formattedData);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);

        if (!cancelled) {
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (serviceId) {
      loadHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [serviceId, period, refreshKey, refreshCounter]);

  // Atualiza o gráfico automaticamente a cada 15 segundos.
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCounter((current) => current + 1);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  function formatDate(value) {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <p>Carregando histórico...</p>;
  }

  if (history.length === 0) {
    return <p>Nenhum histórico disponível para este serviço.</p>;
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={history}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
          />

          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={formatDate}
            minTickGap={35}
          />

          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            unit=" ms"
          />

          <Tooltip
            labelFormatter={(value) => formatDate(value)}
            formatter={(value) => [
              `${value} ms`,
              "Tempo de resposta",
            ]}
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#f8fafc",
            }}
          />

          <Line
            type="monotone"
            dataKey="responseTime"
            name="Tempo de resposta"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;
              const isSlow = payload.responseTime > 1000;

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSlow ? 6 : 4}
                  fill={isSlow ? "#ef4444" : "#38bdf8"}
                  stroke={isSlow ? "#fecaca" : "#38bdf8"}
                  strokeWidth={isSlow ? 2 : 1}
                />
              );
            }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
