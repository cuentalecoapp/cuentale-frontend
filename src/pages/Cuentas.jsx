import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import InvoiceModal from "../components/InvoiceModal.jsx";
import CuentaPorPagarModal from "../components/CuentaPorPagarModal.jsx";
import ConfirmarBorrado from "../components/ConfirmarBorrado.jsx";
import { imprimirFactura } from "../imprimirFactura.js";

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

function estaVencida(fechaVencimiento, estado) {
  if (!fechaVencimiento || estado !== "pendiente") return false;
  return new Date(fechaVencimiento) < new Date(new Date().toDateString());
}

export default function Cuentas({ negocioId }) {
  const [pestaña, setPestaña] = useState("cobrar"); // "cobrar" | "pagar"
  const [facturas, setFacturas] = useState([]);
  const [cuentasPagar, setCuentasPagar] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [borrar, setBorrar] = useState(null); // { tipo: "factura"|"deuda", id }

  const cargar = useCallback(async () => {
    setError("");
    try {
      const [f, c] = await Promise.all([
        api.listarFacturas(negocioId),
        api.listarCuentasPorPagar(negocioId),
      ]);
      setFacturas(f);
      setCuentasPagar(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [negocioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function borrarSeleccion() {
    if (borrar.tipo === "factura") {
      await api.eliminarFactura(negocioId, borrar.id);
    } else {
      await api.eliminarCuentaPorPagar(negocioId, borrar.id);
    }
    setBorrar(null);
    setCargando(true);
    cargar();
  }

  async function marcarFacturaPagada(id) {
    setProcesando(id);
    try {
      await api.marcarFacturaPagada(negocioId, id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  // Trae el detalle completo de la factura (con logo y datos del negocio) y la abre para imprimir
  async function imprimir(id) {
    setProcesando(id);
    try {
      const detalle = await api.verFactura(negocioId, id);
      imprimirFactura(detalle);
    } catch (err) {
      setError("No pudimos abrir la factura para imprimir.");
    } finally {
      setProcesando(null);
    }
  }

  async function marcarCuentaPagada(id) {
    setProcesando(id);
    try {
      await api.marcarCuentaPagada(negocioId, id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  function manejarGuardado() {
    setModalAbierto(false);
    setCargando(true);
    cargar();
  }

  const listaActual = pestaña === "cobrar" ? facturas : cuentasPagar;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 1rem" }}>Cuentas</h1>

      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 4 }}>
        <button
          onClick={() => setPestaña("cobrar")}
          aria-pressed={pestaña === "cobrar"}
          style={{ flex: 1, height: 38, borderRadius: 8, border: "none", background: pestaña === "cobrar" ? "#fff" : "transparent", fontSize: 14, fontWeight: 500, color: pestaña === "cobrar" ? "var(--text)" : "var(--text-muted)" }}
        >
          Por cobrar
        </button>
        <button
          onClick={() => setPestaña("pagar")}
          aria-pressed={pestaña === "pagar"}
          style={{ flex: 1, height: 38, borderRadius: 8, border: "none", background: pestaña === "pagar" ? "#fff" : "transparent", fontSize: 14, fontWeight: 500, color: pestaña === "pagar" ? "var(--text)" : "var(--text-muted)" }}
        >
          Por pagar
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          onClick={() => setModalAbierto(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, height: 40, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--ink-800)", color: "#fff", fontSize: 14, fontWeight: 500 }}
        >
          <i className="ti ti-plus" style={{ fontSize: 16 }} /> {pestaña === "cobrar" ? "Nueva factura" : "Nueva deuda"}
        </button>
      </div>

      {error && <p role="alert" style={{ color: "var(--gasto)", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      {cargando ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando…</p>
      ) : listaActual.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: 14 }}>
          <i className={`ti ${pestaña === "cobrar" ? "ti-file-invoice" : "ti-receipt-2"}`} style={{ fontSize: 32, display: "block", margin: "0 auto 10px" }} />
          {pestaña === "cobrar" ? "Aún no has creado ninguna factura." : "Aún no tienes deudas registradas."}
        </div>
      ) : (
        <ul className="lista-anim" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {pestaña === "cobrar"
            ? facturas.map((f) => {
                const estilo = ESTADO_ESTILO[f.estado];
                const vencida = estaVencida(f.fecha_vencimiento, f.estado);
                return (
                  <li key={f.id} style={{ background: "var(--surface-1)", borderRadius: "var(--radius-md)", padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Factura #{f.numero}</p>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 0" }}>{f.cliente_nombre}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: vencida ? "var(--gasto-bg)" : estilo.bg, color: vencida ? "var(--gasto)" : estilo.color, whiteSpace: "nowrap" }}>
                        {vencida ? "Vencida" : estilo.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 600 }}>{formatoMoneda.format(f.total)}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {f.estado === "pendiente" && (
                          <button onClick={() => marcarFacturaPagada(f.id)} disabled={procesando === f.id}
                            style={{ height: 34, padding: "0 12px", borderRadius: 8, border: "none", background: "var(--ingreso)", color: "var(--ingreso-bg)", fontSize: 13, fontWeight: 500, opacity: procesando === f.id ? 0.6 : 1 }}>
                            {procesando === f.id ? "..." : "Marcar pagada"}
                          </button>
                        )}
                        <button onClick={() => imprimir(f.id)} disabled={procesando === f.id} aria-label="Imprimir factura"
                          title="Imprimir o descargar factura"
                          style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "var(--brand-light)", color: "var(--brand)", flexShrink: 0 }}>
                          <i className="ti ti-printer" style={{ fontSize: 15 }} />
                        </button>
                        <button onClick={() => setBorrar({ tipo: "factura", id: f.id })} aria-label="Borrar factura"
                          style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "var(--gasto-bg)", color: "var(--gasto)", flexShrink: 0 }}>
                          <i className="ti ti-trash" style={{ fontSize: 15 }} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })
            : cuentasPagar.map((c) => {
                const vencida = estaVencida(c.fecha_vencimiento, c.estado);
                return (
                  <li key={c.id} style={{ background: "var(--surface-1)", borderRadius: "var(--radius-md)", padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{c.proveedor_nombre}</p>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "2px 0 0" }}>{c.concepto}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: vencida ? "var(--gasto-bg)" : ESTADO_ESTILO[c.estado].bg, color: vencida ? "var(--gasto)" : ESTADO_ESTILO[c.estado].color, whiteSpace: "nowrap" }}>
                        {vencida ? "Vencida" : ESTADO_ESTILO[c.estado].label}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 600 }}>{formatoMoneda.format(c.monto)}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {c.estado === "pendiente" && (
                          <button onClick={() => marcarCuentaPagada(c.id)} disabled={procesando === c.id}
                            style={{ height: 34, padding: "0 12px", borderRadius: 8, border: "none", background: "var(--gasto)", color: "var(--gasto-bg)", fontSize: 13, fontWeight: 500, opacity: procesando === c.id ? 0.6 : 1 }}>
                            {procesando === c.id ? "..." : "Marcar pagada"}
                          </button>
                        )}
                        <button onClick={() => setBorrar({ tipo: "deuda", id: c.id })} aria-label="Borrar deuda"
                          style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "var(--gasto-bg)", color: "var(--gasto)", flexShrink: 0 }}>
                          <i className="ti ti-trash" style={{ fontSize: 15 }} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
        </ul>
      )}

      {modalAbierto && pestaña === "cobrar" && (
        <InvoiceModal negocioId={negocioId} onCerrar={() => setModalAbierto(false)} onGuardado={manejarGuardado} />
      )}
      {modalAbierto && pestaña === "pagar" && (
        <CuentaPorPagarModal negocioId={negocioId} onCerrar={() => setModalAbierto(false)} onGuardado={manejarGuardado} />
      )}

      {borrar && (
        <ConfirmarBorrado
          mensaje={borrar.tipo === "factura" ? "Se eliminará esta factura." : "Se eliminará esta deuda."}
          onConfirmar={borrarSeleccion}
          onCancelar={() => setBorrar(null)}
        />
      )}
    </div>
  );
}
