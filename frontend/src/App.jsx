
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { Activity, Server, Clock3 } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import History from "./pages/History";

import "./App.css";

// Define a estrutura principal da aplicação e suas rotas de navegação.
function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Activity size={30} />
          <div>
            <strong>SystemMonitor</strong>
            <span>Monitoramento de serviços</span>
          </div>
        </div>

        <nav className="navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Activity size={19} />
            Dashboard
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Server size={19} />
            Serviços
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Clock3 size={19} />
            Histórico
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <span className="pulse" />
          <span>Monitor local</span>
          <small>API Python · SQLite</small>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
