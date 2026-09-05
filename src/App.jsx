import { useEffect, useState } from "react";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Cuentas from "./pages/Cuentas.jsx";
import Inventario from "./pages/Inventario.jsx";
import Reportes from "./pages/Reportes.jsx";
import Equipo from "./pages/Equipo.jsx";
import Ajustes from "./pages/Ajustes.jsx";

const SECCIONES = [
  { id: "inicio", etiqueta: "Inicio", icono: "ti-home" },
  { id: "cuentas", etiqueta: "Cuentas", icono: "ti-file-invoice" },
  { id: "inventario", etiqueta: "Inventario", icono: "ti-box" },
  { id: "reportes", etiqueta: "Reportes", icono: "ti-chart-bar" },
  { id: "equipo", etiqueta: "Equipo", icono: "ti-users" },
  { id: "ajustes", etiqueta: "Ajustes", icono: "ti-settings" },
];

function SelectorNegocio({ negocios, negocioActual, onCambiar, onCrearNuevo }) {
  const [abierto, setAbierto] = useState(false);

  if (negocios.length <= 1) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setAbierto((a) => !a)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}
      >
        <i className="ti ti-chevron-down" style={{ fontSize: 16 }} />
      </button>
      {abierto && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "var(--surface-0)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 200,
            zIndex: 40,
            overflow: "hidden",
          }}
        >
          {negocios.map((n) => (
            <button
              key={n.id}
              role="option"
              aria-selected={n.id === negocioActual.id}
              onClick={() => {
                onCambiar(n);
                setAbierto(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                border: "none",
                background: n.id === negocioActual.id ? "var(--surface-1)" : "var(--surface-0)",
                fontSize: 14,
              }}
            >
              {n.nombre}
            </button>
          ))}
          <button
            onClick={() => {
              onCrearNuevo();
              setAbierto(false);
            }}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderTop: "1px solid var(--border)", background: "var(--surface-0)", fontSize: 14, color: "var(--brand)" }}
          >
            <i className="ti ti-plus" style={{ fontSize: 14 }} /> Nuevo negocio
          </button>
        </div>
      )}
    </div>
  );
}

function BarraConexion() {
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);

  async function actualizarConteo() {
    setPendientes(await api.contarPendientesSincronizar());
  }

  async function sincronizar() {
    setSincronizando(true);
    await api.sincronizarPendientes();
    await actualizarConteo();
    setSincronizando(false);
  }

  useEffect(() => {
    actualizarConteo();

    function manejarOnline() {
      setEnLinea(true);
      sincronizar();
    }
    function manejarOffline() {
      setEnLinea(false);
    }

    window.addEventListener("online", manejarOnline);
    window.addEventListener("offline", manejarOffline);
    return () => {
      window.removeEventListener("online", manejarOnline);
      window.removeEventListener("offline", manejarOffline);
    };
  }, []);

  if (enLinea && pendientes === 0) return null;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 500,
        background: enLinea ? "var(--brand-light)" : "#FAEEDA",
        color: enLinea ? "var(--brand)" : "#633806",
      }}
    >
      <i className={`ti ${enLinea ? "ti-refresh" : "ti-wifi-off"}`} style={{ fontSize: 14 }} />
      {!enLinea && "Sin conexión — lo que registres se guarda y se sincroniza después"}
      {enLinea && pendientes > 0 && (sincronizando ? "Sincronizando..." : `${pendientes} movimiento(s) por sincronizar`)}
    </div>
  );
}

export default function App() {
  const [autenticado, setAutenticado] = useState(api.haySesion());
  const [negocios, setNegocios] = useState([]);
  const [negocioActual, setNegocioActual] = useState(null);
  const [creandoNegocio, setCreandoNegocio] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [seccion, setSeccion] = useState("inicio");

  useEffect(() => {
    if (!autenticado) {
      setVerificando(false);
      return;
    }
    api
      .listarNegocios()
      .then((lista) => {
        setNegocios(lista);
        setNegocioActual(lista[0] || null);
      })
      .catch(() => {
        api.cerrarSesion();
        setAutenticado(false);
      })
      .finally(() => setVerificando(false));
  }, [autenticado]);

  if (verificando) {
    return (
      <div className="login-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", maxWidth: 460, margin: "0 auto" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando…</p>
      </div>
    );
  }

  if (!autenticado) {
    return <Login onEntrar={() => setAutenticado(true)} />;
  }

  if (!negocioActual || creandoNegocio) {
    return (
      <Onboarding
        onCreado={(nuevo) => {
          setNegocios((prev) => [...prev, nuevo]);
          setNegocioActual(nuevo);
          setCreandoNegocio(false);
        }}
      />
    );
  }

  function cerrarSesion() {
    api.cerrarSesion();
    setAutenticado(false);
    setNegocios([]);
    setNegocioActual(null);
  }

  return (
    <div className="app-shell">
      <BarraConexion />
      <div className="contenido-scroll" style={{ flex: 1, overflowY: "auto" }}>
        {seccion === "inicio" && (
          <Dashboard
            negocio={negocioActual}
            onCerrarSesion={cerrarSesion}
            selectorNegocio={
              <SelectorNegocio
                negocios={negocios}
                negocioActual={negocioActual}
                onCambiar={setNegocioActual}
                onCrearNuevo={() => setCreandoNegocio(true)}
              />
            }
          />
        )}
        {seccion === "cuentas" && <Cuentas negocioId={negocioActual.id} />}
        {seccion === "inventario" && <Inventario negocioId={negocioActual.id} />}
        {seccion === "reportes" && <Reportes negocioId={negocioActual.id} />}
        {seccion === "equipo" && <Equipo negocioId={negocioActual.id} />}
        {seccion === "ajustes" && <Ajustes negocioId={negocioActual.id} />}
      </div>

      <nav
        aria-label="Navegación principal"
        className="barra-navegacion"
        style={{ display: "flex", justifyContent: "space-around", gap: 4, padding: "10px 12px", margin: "0 10px 10px", borderRadius: "var(--radius-lg)", background: "var(--surface-0)", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}
      >
        {SECCIONES.map((s) => {
          const activo = seccion === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              aria-current={activo ? "page" : undefined}
              style={{
                border: "none",
                background: activo ? "var(--brand-light)" : "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                height: "auto",
                padding: "8px 14px",
                borderRadius: 14,
                color: activo ? "var(--brand)" : "var(--text-secondary)",
                transition: "background 0.2s ease",
              }}
            >
              <i className={`ti ${s.icono} ${activo ? "nav-activo" : ""}`} style={{ fontSize: 22 }} />
              <span style={{ fontSize: 11, fontWeight: activo ? 800 : 600 }}>{s.etiqueta}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
