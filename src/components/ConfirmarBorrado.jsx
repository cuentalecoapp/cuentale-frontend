import { useState } from "react";

// Ventanita de confirmación antes de borrar algo. Evita borrados accidentales.
// Se usa en movimientos, facturas, deudas y productos.
export default function ConfirmarBorrado({ mensaje, onConfirmar, onCancelar }) {
  const [borrando, setBorrando] = useState(false);

  async function confirmar() {
    setBorrando(true);
    try {
      await onConfirmar();
    } finally {
      setBorrando(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-confirmar"
      onClick={onCancelar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22,20,58,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 20,
        animation: "aparecer 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "var(--surface-0)",
          borderRadius: 24,
          padding: "1.75rem 1.5rem 1.5rem",
          textAlign: "center",
          animation: "subir 0.2s ease",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--gasto-bg, #FDE8E8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <i className="ti ti-trash" style={{ fontSize: 26, color: "var(--gasto, #E24C4C)" }} />
        </div>

        <h2 id="titulo-confirmar" style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
          ¿Seguro que quieres borrar?
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.4 }}>
          {mensaje || "Esta acción no se puede deshacer."}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancelar}
            disabled={borrando}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              border: "none",
              background: "var(--surface-2, #F0EEF6)",
              color: "var(--text)",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={borrando}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              border: "none",
              background: "var(--gasto, #E24C4C)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              opacity: borrando ? 0.6 : 1,
            }}
          >
            {borrando ? "Borrando..." : "Sí, borrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
