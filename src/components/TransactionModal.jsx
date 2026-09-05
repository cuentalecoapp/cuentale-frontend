import { useState, useRef, useEffect } from "react";
import { api } from "../api.js";

export default function TransactionModal({ negocioId, tipo, onCerrar, onGuardado }) {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const primerCampoRef = useRef(null);

  useEffect(() => {
    primerCampoRef.current?.focus();
  }, []);

  function manejarTecla(e) {
    if (e.key === "Escape") onCerrar();
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    const montoNumero = Number(monto);
    if (!montoNumero || montoNumero <= 0) {
      setError("Escribe un monto mayor a cero.");
      return;
    }
    if (!descripcion.trim()) {
      setError("Escribe una breve descripción.");
      return;
    }

    setGuardando(true);
    try {
      await api.crearTransaccion(negocioId, {
        tipo,
        monto: montoNumero,
        descripcion: descripcion.trim(),
      });
      onGuardado();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const esIngreso = tipo === "ingreso";
  const colorAccion = esIngreso ? "var(--ingreso)" : "var(--gasto)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal"
      onKeyDown={manejarTecla}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22, 20, 58, 0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onCerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--surface-0)",
          borderRadius: "20px 20px 0 0",
          padding: "1.5rem",
          paddingBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 id="titulo-modal" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {esIngreso ? "Registrar ingreso" : "Registrar gasto"}
          </h2>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            style={{ background: "none", border: "none", width: 32, height: 32 }}
          >
            <i className="ti ti-x" style={{ fontSize: 20, color: "var(--text-muted)" }} />
          </button>
        </div>

        <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="monto" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
              Monto
            </label>
            <div style={{ position: "relative" }}>
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                }}
              >
                $
              </span>
              <input
                ref={primerCampoRef}
                id="monto"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                required
                style={{
                  height: 50,
                  width: "100%",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  padding: "0 14px 0 28px",
                  fontSize: 20,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="descripcion" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
              ¿De qué se trata?
            </label>
            <input
              id="descripcion"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={esIngreso ? "Ej. Venta mostrador" : "Ej. Harina y levadura"}
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

          {error && (
            <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            style={{
              height: 50,
              borderRadius: "var(--radius-md)",
              border: "none",
              background: colorAccion,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              marginTop: 6,
              opacity: guardando ? 0.7 : 1,
            }}
          >
            {guardando ? "Guardando..." : `Guardar ${esIngreso ? "ingreso" : "gasto"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
