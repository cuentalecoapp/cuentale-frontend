import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api.js";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function etiquetaMes(valor) {
  const [, mes] = valor.split("-");
  return MESES[Number(mes) - 1];
}

function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: 0, color: p.color }}>
          {p.name}: {formatoMoneda.format(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Reportes({ negocioId }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .reporteMensual(negocioId)
      .then((r) => setDatos(r.map((d) => ({ ...d, etiqueta: etiquetaMes(d.mes) }))))
      .catch((err) => setError(err.message));
  }, [negocioId]);

  const totalEntradas = datos?.reduce((s, d) => s + d.entradas, 0) || 0;
  const totalSalidas = datos?.reduce((s, d) => s + d.salidas, 0) || 0;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Reportes</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 1.25rem" }}>
        Últimos 6 meses de tu negocio
      </p>

      {error && (
        <p role="alert" style={{ color: "var(--gasto)", fontSize: 14 }}>
          {error}
        </p>
      )}

      {!datos ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando reportes…</p>
      ) : datos.every((d) => d.entradas === 0 && d.salidas === 0) ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: 14 }}>
          <i className="ti ti-chart-bar" style={{ fontSize: 32, display: "block", margin: "0 auto 10px" }} />
          Aún no hay suficientes movimientos para mostrar un reporte.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, background: "var(--ingreso-bg)", borderRadius: "var(--radius-md)", padding: 14 }}>
              <p style={{ fontSize: 12, color: "var(--ingreso)", margin: "0 0 4px", fontWeight: 500 }}>Total entradas</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 600, margin: 0, color: "var(--ingreso)" }}>
                {formatoMoneda.format(totalEntradas)}
              </p>
            </div>
            <div style={{ flex: 1, background: "var(--gasto-bg)", borderRadius: "var(--radius-md)", padding: 14 }}>
              <p style={{ fontSize: 12, color: "var(--gasto)", margin: "0 0 4px", fontWeight: 500 }}>Total salidas</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 600, margin: 0, color: "var(--gasto)" }}>
                {formatoMoneda.format(totalSalidas)}
              </p>
            </div>
          </div>

          <div style={{ height: 220, marginBottom: "0.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 12, fill: "#8A899E" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8A899E" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: "var(--surface-2)" }} />
                <Bar dataKey="entradas" name="Entradas" fill="#0F6E56" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salidas" name="Salidas" fill="#D85A30" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12, color: "var(--text-secondary)" }}>
            <span><i className="ti ti-square-filled" style={{ color: "#0F6E56", fontSize: 10 }} /> Entradas</span>
            <span><i className="ti ti-square-filled" style={{ color: "#D85A30", fontSize: 10 }} /> Salidas</span>
          </div>
        </>
      )}
    </div>
  );
}
