import { useEffect, useState } from "react";
import { api } from "../api.js";

const ESTILO_TIPO = {
  alerta: { bg: "var(--gasto-bg)", color: "var(--gasto)", icono: "ti-alert-triangle" },
  sugerencia: { bg: "#FAEEDA", color: "#633806", icono: "ti-bulb" },
  info: { bg: "var(--surface-2)", color: "var(--text-secondary)", icono: "ti-info-circle" },
};

export default function Recomendaciones({ negocioId }) {
  const [lista, setLista] = useState(null);

  useEffect(() => {
    api
      .recomendaciones(negocioId)
      .then((r) => setLista(r.recomendaciones))
      .catch(() => setLista([]));
  }, [negocioId]);

  if (!lista || lista.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 8px", fontWeight: 500 }}>
        Para tu negocio
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lista.map((r, i) => {
          const estilo = ESTILO_TIPO[r.tipo] || ESTILO_TIPO.info;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                background: estilo.bg,
                borderRadius: "var(--radius-md)",
                padding: 12,
              }}
            >
              <i className={`ti ${estilo.icono}`} style={{ fontSize: 18, color: estilo.color, flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: estilo.color }}>{r.titulo}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>{r.detalle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
