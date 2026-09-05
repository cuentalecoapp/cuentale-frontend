import { useState } from "react";
import { api } from "../api.js";

export default function CuentaPorPagarModal({ negocioId, onCerrar, onGuardado }) {
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    if (!proveedorNombre.trim() || !concepto.trim()) {
      setError("Completa el proveedor y el concepto.");
      return;
    }
    if (!monto || Number(monto) <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }

    setGuardando(true);
    try {
      await api.crearCuentaPorPagar(negocioId, {
        proveedor_nombre: proveedorNombre.trim(),
        concepto: concepto.trim(),
        monto: Number(monto),
        fecha_vencimiento: fechaVencimiento || undefined,
      });
      onGuardado();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-cuenta-pagar"
      style={{ position: "fixed", inset: 0, background: "rgba(22,20,58,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}
      onClick={onCerrar}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "var(--surface-0)", borderRadius: "20px 20px 0 0", padding: "1.5rem", paddingBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 id="titulo-cuenta-pagar" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Registrar deuda</h2>
          <button onClick={onCerrar} aria-label="Cerrar" style={{ background: "none", border: "none", width: 32, height: 32 }}>
            <i className="ti ti-x" style={{ fontSize: 20, color: "var(--text-muted)" }} />
          </button>
        </div>

        <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="proveedor" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>¿A quién le debes?</label>
            <input id="proveedor" value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} placeholder="Ej. Distribuidora Harinas SAS" required
              style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15 }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="concepto" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>¿De qué se trata?</label>
            <input id="concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej. Pedido de insumos de enero" required
              style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15 }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="monto-deuda" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Monto</label>
              <input id="monto-deuda" type="number" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" required
                style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15, fontFamily: "var(--font-mono)" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="vence" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Vence (opcional)</label>
              <input id="vence" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)}
                style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 14 }} />
            </div>
          </div>

          {error && <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={guardando} style={{ height: 50, borderRadius: "var(--radius-md)", border: "none", background: "var(--gasto)", color: "#fff", fontSize: 15, fontWeight: 600, opacity: guardando ? 0.7 : 1 }}>
            {guardando ? "Guardando..." : "Registrar deuda"}
          </button>
        </form>
      </div>
    </div>
  );
}
