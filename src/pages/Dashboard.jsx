import { useEffect, useState, useCallback } from "react";
import { api } from "../api.js";
import TransactionModal from "../components/TransactionModal.jsx";
import { exportarCsv } from "../exportarCsv.js";
import { exportarExcelContable } from "../exportarExcelContable.js";
import Recomendaciones from "../components/Recomendaciones.jsx";
import ScanReceiptModal from "../components/ScanReceiptModal.jsx";
import ConfirmarBorrado from "../components/ConfirmarBorrado.jsx";
import FlujoCaja from "../components/FlujoCaja.jsx";
import { SimboloCuentale } from "../components/Logo.jsx";

const ICONOS_CATEGORIA = {
  Ventas: "ti-shopping-bag",
  "Otros ingresos": "ti-plus",
  Insumos: "ti-shopping-cart",
  Arriendo: "ti-home",
  Servicios: "ti-bolt",
  "Otros gastos": "ti-dots",
};

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function Dashboard({ negocio, onCerrarSesion, selectorNegocio }) {
  const [resumen, setResumen] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(null); // "ingreso" | "gasto" | null
  const [borrarId, setBorrarId] = useState(null); // id del movimiento a borrar

  const cargarDatos = useCallback(async () => {
    setError("");
    try {
      const [resumenDatos, movimientosDatos, alertasDatos] = await Promise.all([
        api.resumen(negocio.id),
        api.transacciones(negocio.id),
        api.alertas(negocio.id),
      ]);
      setResumen(resumenDatos);
      setMovimientos(movimientosDatos);
      setAlertas(alertasDatos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [negocio.id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function borrarMovimiento() {
    await api.eliminarTransaccion(negocio.id, borrarId);
    setBorrarId(null);
    setCargando(true);
    cargarDatos();
  }

  function manejarGuardado() {
    setModalAbierto(null);
    setCargando(true);
    cargarDatos();
  }

  async function exportarParaContador() {
    try {
      const datos = await api.reporteContable(negocio.id);
      exportarExcelContable(datos);
    } catch (err) {
      setError(err.message);
    }
  }

  function exportarMovimientos() {
    exportarCsv(
      `movimientos-${negocio.nombre.replace(/\s+/g, "-")}.csv`,
      movimientos,
      [
        { etiqueta: "Fecha", obtener: (m) => m.fecha },
        { etiqueta: "Tipo", obtener: (m) => m.tipo },
        { etiqueta: "Categoría", obtener: (m) => m.categoria || "" },
        { etiqueta: "Descripción", obtener: (m) => m.descripcion },
        { etiqueta: "Monto", obtener: (m) => m.monto },
      ]
    );
  }

  const totalMovido = resumen ? resumen.entradas + resumen.salidas : 0;
  const porcentajeAhorrado =
    resumen && totalMovido > 0 ? Math.round((resumen.saldo / resumen.entradas) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem 0", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span className="logo-flotante" style={{ display: "inline-flex" }}>
            <SimboloCuentale tamano={34} />
          </span>
          <span className="nombre-flotante" style={{ fontSize: 20, fontWeight: 900, color: "#128C6E", letterSpacing: "-0.3px", textShadow: "1px 1px 0 #0C6A52, 2px 2px 0 rgba(12,106,82,0.5), 2px 3px 5px rgba(0,0,0,0.25)" }}>Cuéntale</span>
        </div>
        <button
          onClick={exportarParaContador}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            height: 32,
            padding: "0 12px",
            borderRadius: 16,
            border: "1.5px solid var(--verde)",
            background: "var(--surface-0)",
            color: "var(--verde)",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <i className="ti ti-file-spreadsheet" style={{ fontSize: 15 }} /> Excel contador
        </button>
      </div>
      <div style={{ padding: "1rem 1.5rem 1.5rem" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: negocio.color_marca,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500,
                fontSize: 15,
                color: "#fff",
              }}
            >
              {negocio.iniciales}
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontWeight: 600 }}>Tu negocio</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <p style={{ fontSize: 16, fontWeight: 500, margin: "1px 0 0" }}>{negocio.nombre}</p>
                {selectorNegocio}
              </div>
            </div>
          </div>
          <button
            onClick={onCerrarSesion}
            aria-label="Cerrar sesión"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              minWidth: 52,
              height: 52,
              borderRadius: 14,
              border: "none",
              background: "var(--surface-0)",
              color: "var(--gasto)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: 18 }} />
            <span style={{ fontSize: 10, fontWeight: 700 }}>Salir</span>
          </button>
        </header>

        {error && (
          <p role="alert" style={{ color: "var(--gasto)", fontSize: 14, marginBottom: 16 }}>
            {error}
          </p>
        )}

        {alertas && (alertas.facturasVencidas.length > 0 || alertas.cuentasVencidas.length > 0) && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--gasto-bg)",
              color: "var(--gasto)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
              marginBottom: "1rem",
              fontSize: 13,
            }}
          >
            <i className="ti ti-alert-triangle" style={{ fontSize: 18, flexShrink: 0 }} />
            <span>
              Tienes {alertas.facturasVencidas.length + alertas.cuentasVencidas.length} cuenta(s) vencida(s)
              {alertas.facturasVencidas.length > 0 && ` — ${alertas.facturasVencidas.length} por cobrar`}
              {alertas.cuentasVencidas.length > 0 && ` — ${alertas.cuentasVencidas.length} por pagar`}. Revísalas en Cuentas.
            </span>
          </div>
        )}

        <Recomendaciones negocioId={negocio.id} />

        {cargando ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando tus cuentas…</p>
        ) : (
          <>
            <div
              className="tarjeta-saldo aparece"
              style={{
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                marginBottom: "1rem",
              }}
            >
              <p style={{ fontSize: 14, color: "#ffffff", margin: "0 0 4px", fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>Saldo de este mes</p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 34,
                  fontWeight: 800,
                  margin: "0 0 14px",
                  letterSpacing: -0.5,
                  color: "#fff",
                  textShadow: "0 2px 6px rgba(0,0,0,0.40)",
                }}
              >
                {formatoMoneda.format(resumen?.saldo || 0)}
              </p>

              {resumen?.entradas > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 9, borderRadius: 5, background: "rgba(0,0,0,0.22)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(Math.max(porcentajeAhorrado, 0), 100)}%`,
                        background: "#7DEFC4",
                        height: "100%",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "#fff", whiteSpace: "nowrap", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                    {porcentajeAhorrado}% ahorrado
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: 18 }}>
                <span style={{ fontSize: 14, color: "#fff", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                  <i className="ti ti-arrow-up-right" style={{ fontSize: 15, color: "#7DEFC4" }} />{" "}
                  {formatoMoneda.format(resumen?.entradas || 0)}
                </span>
                <span style={{ fontSize: 14, color: "#fff", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                  <i className="ti ti-arrow-down-right" style={{ fontSize: 14, color: "#F0997B" }} />{" "}
                  {formatoMoneda.format(resumen?.salidas || 0)}
                </span>
              </div>
            </div>

            <FlujoCaja negocioId={negocio.id} />

            <div style={{ border: "none", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: "1.25rem", background: "var(--surface-0)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <button
                onClick={() => setModalAbierto("ingreso")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "#16A483",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(18,140,110,0.35)",
                }}
              >
                <i className="ti ti-plus" style={{ fontSize: 18 }} /> Ingreso
              </button>
              <button
                onClick={() => setModalAbierto("gasto")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "#E24C4C",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(226,76,76,0.35)",
                }}
              >
                <i className="ti ti-plus" style={{ fontSize: 18 }} /> Gasto
              </button>
            </div>

            <button
              onClick={() => setModalAbierto("escaner")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                height: 42,
                fontSize: 14,
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                border: "1.5px solid #2A2320",
                background: "var(--surface-0)",
                color: "var(--text)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
              }}
            >
              <i className="ti ti-camera" style={{ fontSize: 17 }} /> Escanear recibo
            </button>
            </div>

            {resumen?.gastosPorCategoria?.length > 0 && (
              <>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 8px", fontWeight: 500 }}>
                  En qué se va el gasto
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
                  {resumen.gastosPorCategoria.map((c) => (
                    <span
                      key={c.categoria}
                      style={{
                        fontSize: 12,
                        padding: "6px 12px",
                        borderRadius: 20,
                        background: "var(--surface-2)",
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {c.categoria} {formatoMoneda.format(c.total)}
                    </span>
                  ))}
                </div>
              </>
            )}

            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 8px", fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Movimientos recientes
              {movimientos.length > 0 && (
                <button
                  onClick={exportarMovimientos}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    fontSize: 12,
                    fontWeight: 500,
                    height: "auto",
                  }}
                >
                  <i className="ti ti-download" style={{ fontSize: 14 }} /> Exportar
                </button>
              )}
            </p>

            {movimientos.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem 1rem",
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                <i className="ti ti-receipt" style={{ fontSize: 28, display: "block", margin: "0 auto 8px" }} />
                Aún no tienes movimientos. Registra tu primer ingreso o gasto arriba.
              </div>
            ) : (
              <ul className="lista-anim" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {movimientos.map((m) => {
                  const esIngreso = m.tipo === "ingreso";
                  return (
                    <li
                      key={m.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 10,
                        borderRadius: 12,
                        background: "var(--surface-1)",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: esIngreso ? "var(--ingreso-bg)" : "var(--gasto-bg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className={`ti ${ICONOS_CATEGORIA[m.categoria] || "ti-tag"}`}
                          style={{ fontSize: 17, color: esIngreso ? "var(--ingreso)" : "var(--gasto)" }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, margin: 0, fontWeight: 500 }}>{m.descripcion}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "1px 0 0" }}>
                          {new Date(m.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 14,
                          fontWeight: 500,
                          color: esIngreso ? "var(--ingreso)" : "var(--gasto)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {esIngreso ? "+" : "−"} {formatoMoneda.format(m.monto)}
                      </span>
                      <button
                        onClick={() => setBorrarId(m.id)}
                        aria-label={`Borrar ${m.descripcion}`}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          color: "var(--text-muted)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="ti ti-trash" style={{ fontSize: 16 }} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      {modalAbierto === "ingreso" || modalAbierto === "gasto" ? (
        <TransactionModal
          negocioId={negocio.id}
          tipo={modalAbierto}
          onCerrar={() => setModalAbierto(null)}
          onGuardado={manejarGuardado}
        />
      ) : null}

      {modalAbierto === "escaner" && (
        <ScanReceiptModal
          negocioId={negocio.id}
          onCerrar={() => setModalAbierto(null)}
          onGuardado={manejarGuardado}
        />
      )}

      {borrarId && (
        <ConfirmarBorrado
          mensaje="Se eliminará este movimiento de tu historial."
          onConfirmar={borrarMovimiento}
          onCancelar={() => setBorrarId(null)}
        />
      )}
    </div>
  );
}
