import { useEffect, useState } from "react";

// Interruptor de tema claro/oscuro.
// Guarda la preferencia en el navegador (localStorage) para recordarla.
export default function InterruptorTema() {
  const [oscuro, setOscuro] = useState(false);

  // Al cargar, leemos la preferencia guardada
  useEffect(() => {
    const guardado = localStorage.getItem("tema-cuentale");
    const esOscuro = guardado === "oscuro";
    setOscuro(esOscuro);
    aplicarTema(esOscuro);
  }, []);

  function aplicarTema(esOscuro) {
    if (esOscuro) {
      document.body.classList.add("tema-oscuro");
    } else {
      document.body.classList.remove("tema-oscuro");
    }
  }

  function cambiar() {
    const nuevo = !oscuro;
    setOscuro(nuevo);
    aplicarTema(nuevo);
    localStorage.setItem("tema-cuentale", nuevo ? "oscuro" : "claro");
  }

  return (
    <div
      style={{
        background: "var(--surface-0)",
        borderRadius: "var(--radius-lg)",
        padding: 18,
        marginBottom: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>{oscuro ? "🌙" : "☀️"}</span>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text)" }}>
            {oscuro ? "Modo oscuro" : "Modo claro"}
          </p>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0 }}>
            Elige cómo se ve la app
          </p>
        </div>
      </div>

      {/* Interruptor visual (switch) */}
      <button
        onClick={cambiar}
        aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        style={{
          width: 56,
          height: 30,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: oscuro ? "var(--verde)" : "var(--border-strong)",
          position: "relative",
          transition: "background 0.2s ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: oscuro ? 29 : 3,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s ease",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          }}
        />
      </button>
    </div>
  );
}
