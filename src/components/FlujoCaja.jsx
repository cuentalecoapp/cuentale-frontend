import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Opciones de periodo que el usuario puede elegir
function finDeMes(offset = 0) {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1 + offset, 0);
}
function enDias(dias) {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + dias);
}
function aStr(fecha) {
  return fecha.toISOString().slice(0, 10);
}

const PERIODOS = [
  { clave: "mes", etiqueta: "Fin de este mes", fecha: () => aStr(finDeMes(0)) },
  { clave: "30", etiqueta: "En 30 días", fecha: () => aStr(enDias(30)) },
  { clave: "proximo", etiqueta: "Fin del próximo mes", fecha: () => aStr(finDeMes(1)) },
];

const COLORES = {
  bien: { fondo: "#E8F7F1", borde: "#128C6E", texto: "#0B5943", icono: "ti-circle-check" },
  ajustado: { fondo: "#FFF6E5", borde: "#E8A33D", texto: "#7a4a00", icono: "ti-alert-triangle" },
  alerta: { fondo: "#FDEEEE", borde: "#E24C4C", texto: "#8a2020", icono: "ti-alert-circle" },
};

export default function FlujoCaja({ negocioId }) {
  const [periodo, setPeriodo] = useState("mes");
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const periodoSel = PERIODOS.find((p) => p.clave === periodo) || PERIODOS[0];
      const resultado = await api.flujoCaja(negocioId, periodoSel.fecha());
      setDatos(resultado);
    } catch (err) {
      setError("No pudimos calcular tu proyección ahora.");
    } finally {
      setCargando(false);
    }
  }, [negocioId, periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const color = datos ? COLORES[datos.estado] || COLORES.bien : COLORES.bien;

  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: `2px solid ${color.borde}`,
        background: color.fondo,
        padding: "1.1rem 1.2rem",
        marginBottom: "1rem",
        boxShadow: "0 8px 24px rgba(18,140,110,0.30)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: color.texto }}>
          ¿Cómo vas para {periodo === "30" ? "los próximos 30 días" : periodo === "proximo" ? "el próximo mes" : "fin de mes"}?
        </h2>
        <i className={`ti ${color.icono}`} style={{ fontSize: 22, color: color.borde }} />
      </div>

      {/* Selector de periodo */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {PERIODOS.map((p) => (
          <button
            key={p.clave}
            onClick={() => setPeriodo(p.clave)}
            style={{
              padding: "5px 11px",
              borderRadius: 999,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: periodo === p.clave ? color.borde : "rgba(0,0,0,0.06)",
              color: periodo === p.clave ? "#fff" : "var(--text-secondary)",
            }}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {cargando ? (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Calculando...</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: "var(--gasto)", margin: 0 }}>{error}</p>
      ) : datos ? (
        <>
          {/* El desglose en lenguaje simple */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            <Fila etiqueta="Tienes ahora" valor={datos.saldoActual} />
            <Fila etiqueta="Te deben (va a entrar)" valor={datos.porCobrar} signo="+" color="var(--ingreso)" />
            <Fila etiqueta="Debes pagar (va a salir)" valor={datos.porPagar} signo="−" color="var(--gasto)" />
            <div style={{ height: 1, background: "rgba(0,0,0,0.1)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: color.texto }}>Te quedarían</span>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: color.borde }}>
                {formatoMoneda.format(datos.proyectado)}
              </span>
            </div>
          </div>

          {/* El mensaje en lenguaje natural, la magia de Cuéntale */}
          <div
            style={{
              background: "rgba(255,255,255,0.6)",
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 13,
              lineHeight: 1.45,
              color: color.texto,
              fontWeight: 500,
            }}
          >
            {datos.mensaje}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Fila({ etiqueta, valor, signo, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{etiqueta}</span>
      <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 500, color: color || "var(--text)" }}>
        {signo || ""} {formatoMoneda.format(valor)}
      </span>
    </div>
  );
}
