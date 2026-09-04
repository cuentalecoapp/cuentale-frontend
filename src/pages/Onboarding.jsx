import { useState } from "react";
import { api } from "../api.js";
import { SimboloCuentale } from "../components/Logo.jsx";

const COLORES = ["#FF6A2B", "#128C6E", "#FFD34E", "#C64C6E", "#3C8FD8"];

export default function Onboarding({ onCreado }) {
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState(COLORES[0]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError("");
    setCargando(true);
    try {
      const negocio = await api.crearNegocio(nombre.trim(), color);
      onCreado(negocio);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="login-shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", maxWidth: 460, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <SimboloCuentale tamano={56} />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "var(--verde)" }}>¿Cómo se llama tu negocio?</h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 1.5rem" }}>
        Con esto arrancamos a llevar tus cuentas.
      </p>

      <div
        aria-hidden="true"
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          fontSize: 22,
          fontWeight: 600,
          color: "#fff",
        }}
      >
        {iniciales || <i className="ti ti-building-store" style={{ fontSize: 28 }} />}
      </div>

      <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="nombre-negocio" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
            Nombre del negocio
          </label>
          <input
            id="nombre-negocio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Panadería Doña Rosa"
            required
            style={{
              height: 46,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              padding: "0 14px",
              fontSize: 15,
            }}
          />
        </div>

        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", margin: "0 0 8px" }}>
            Color de tu negocio
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {COLORES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Elegir color ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: c,
                  border: color === c ? "3px solid var(--ink-900)" : "3px solid transparent",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando || !nombre.trim()}
          style={{
            height: 48,
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--naranja)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: "var(--sombra-media)",
            opacity: cargando || !nombre.trim() ? 0.6 : 1,
          }}
        >
          {cargando ? "Creando..." : "Empezar"}
        </button>
      </form>
    </div>
  );
}
