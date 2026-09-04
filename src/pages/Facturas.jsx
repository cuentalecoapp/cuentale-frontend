import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import InvoiceModal from "../components/InvoiceModal.jsx";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const ESTADO_ESTILO = {
  pendiente: { bg: "#FAEEDA", color: "#633806", label: "Pendiente" },
  pagada: { bg: "var(--ingreso-bg)", color: "var(--ingreso)", label: "Pagada" },
  anulada: { bg: "var(--surface-2)", color: "var(--text-muted)", label: "Anulada" },
};

export default function Facturas({ negocioId }) {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagando, setPagando] = useState(null);

  const cargar = useCallback(async () => {
    setError("");
    try {
      const datos = await api.listarFacturas(negocioId);
      setFacturas(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [negocioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function marcarPagada(facturaId) {
    setPagando(facturaId);
    try {
      await api.marcarFacturaPagada(negocioId, facturaId);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setPagando(null);
    }
  }

  function manejarGuardado() {
    setModalAbierto(false);
    setCargando(true);
    cargar();
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Facturas</h1>
        <button
          onClick={() => setModalAbierto(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 14px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--ink-800)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <i className="ti ti-plus" style={{ fontSize: 16 }} /> Nueva
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--gasto)", fontSize: 14, marginBottom: 16 }}>
          {error}
        </p>
      )}

      {cargando ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando facturas…</p>
      ) : facturas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: 14 }}>
          <i className="ti ti-file-invoice" style={{ fontSize: 32, display: "block", margin: "0 auto 10px" }} />
          Aún no has creado ninguna factura. Empieza con la primera.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {facturas.map((f) => {
            const estilo = ESTADO_ESTILO[f.estado];
            return (
              <li
                key={f.id}
                style={{
                  background: "var(--surface-1)",
                  borderRadius: "var(--radius-md)",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Factura #{f.numero}</p>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 0" }}>{f.cliente_nombre}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: estilo.bg,
                      color: estilo.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {estilo.label}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 600 }}>
                    {formatoMoneda.format(f.total)}
                  </span>
                  {f.estado === "pendiente" && (
                    <button
                      onClick={() => marcarPagada(f.id)}
                      disabled={pagando === f.id}
                      style={{
                        height: 34,
                        padding: "0 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--ingreso)",
                        color: "var(--ingreso-bg)",
                        fontSize: 13,
                        fontWeight: 500,
                        opacity: pagando === f.id ? 0.6 : 1,
                      }}
                    >
                      {pagando === f.id ? "Marcando..." : "Marcar pagada"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalAbierto && (
        <InvoiceModal negocioId={negocioId} onCerrar={() => setModalAbierto(false)} onGuardado={manejarGuardado} />
      )}
    </div>
  );
}
