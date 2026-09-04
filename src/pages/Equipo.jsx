import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";

export default function Equipo({ negocioId }) {
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [invitando, setInvitando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const datos = await api.listarMiembros(negocioId);
      setMiembros(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [negocioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function manejarInvitar(e) {
    e.preventDefault();
    setError("");
    setExito("");
    if (!correo.trim()) return;

    setInvitando(true);
    try {
      const nuevo = await api.invitarMiembro(negocioId, correo.trim());
      setExito(`${nuevo.nombre} ya tiene acceso a este negocio.`);
      setCorreo("");
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setInvitando(false);
    }
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Tu equipo</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 1.25rem" }}>
        Todos los que ves aquí pueden entrar y trabajar en este negocio contigo.
      </p>

      <form onSubmit={manejarInvitar} style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Correo de la persona a invitar"
          aria-label="Correo de la persona a invitar"
          style={{
            flex: 1,
            height: 46,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            padding: "0 14px",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={invitando}
          style={{
            height: 46,
            padding: "0 16px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--ink-800)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            opacity: invitando ? 0.6 : 1,
          }}
        >
          {invitando ? "..." : "Invitar"}
        </button>
      </form>

      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "-1rem 0 1.25rem" }}>
        La persona debe haberse registrado antes en la app con ese mismo correo.
      </p>

      {error && (
        <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}
      {exito && (
        <p role="status" style={{ color: "var(--ingreso)", fontSize: 13, marginBottom: 12 }}>
          {exito}
        </p>
      )}

      {cargando ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando…</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {miembros.map((m) => (
            <li
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-1)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--brand-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand)",
                  fontWeight: 600,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {m.nombre[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{m.nombre}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "1px 0 0" }}>{m.correo}</p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: m.rol === "dueño" ? "var(--brand-light)" : "var(--surface-2)",
                  color: m.rol === "dueño" ? "var(--brand)" : "var(--text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {m.rol === "dueño" ? "Dueño" : "Miembro"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <WhatsappSection negocioId={negocioId} />
    </div>
  );
}

function WhatsappSection({ negocioId }) {
  const [numeros, setNumeros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [numeroNuevo, setNumeroNuevo] = useState("");
  const [error, setError] = useState("");
  const [vinculando, setVinculando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setNumeros(await api.listarNumerosWhatsapp(negocioId));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [negocioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function manejarVincular(e) {
    e.preventDefault();
    setError("");
    if (!numeroNuevo.trim()) return;

    setVinculando(true);
    try {
      await api.vincularWhatsapp(negocioId, numeroNuevo.trim());
      setNumeroNuevo("");
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setVinculando(false);
    }
  }

  async function desvincular(id) {
    try {
      await api.desvincularWhatsapp(negocioId, id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
        <i className="ti ti-brand-whatsapp" style={{ fontSize: 18, color: "#25D366" }} /> WhatsApp
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 1rem" }}>
        Vincula tu número y registra movimientos escribiendo, por ejemplo: <em>"vendí 50 mil en pan"</em>.
      </p>

      <form onSubmit={manejarVincular} style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <input
          value={numeroNuevo}
          onChange={(e) => setNumeroNuevo(e.target.value)}
          placeholder="+573001234567"
          aria-label="Número de WhatsApp a vincular"
          style={{ flex: 1, height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={vinculando}
          style={{ height: 46, padding: "0 16px", borderRadius: "var(--radius-sm)", border: "none", background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 500, opacity: vinculando ? 0.6 : 1 }}
        >
          {vinculando ? "..." : "Vincular"}
        </button>
      </form>

      {error && <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {!cargando && numeros.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {numeros.map((n) => (
            <li key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--surface-1)" }}>
              <span style={{ fontSize: 14, fontFamily: "var(--font-mono)" }}>{n.numero}</span>
              <button onClick={() => desvincular(n.id)} aria-label={`Desvincular ${n.numero}`} style={{ background: "none", border: "none", color: "var(--gasto)", fontSize: 12 }}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
