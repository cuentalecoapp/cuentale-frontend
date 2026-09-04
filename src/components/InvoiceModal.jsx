import { useEffect, useState } from "react";
import { api } from "../api.js";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function itemVacio() {
  return { descripcion: "", cantidad: "1", precio_unitario: "" };
}

export default function InvoiceModal({ negocioId, onCerrar, onGuardado }) {
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [items, setItems] = useState([itemVacio()]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [clientesGuardados, setClientesGuardados] = useState([]);

  useEffect(() => {
    api.listarClientes(negocioId).then(setClientesGuardados).catch(() => {});
  }, [negocioId]);

  function elegirClienteExistente(nombre) {
    setClienteNombre(nombre);
    const encontrado = clientesGuardados.find((c) => c.nombre === nombre);
    if (encontrado) setClienteContacto(encontrado.contacto || "");
  }

  function actualizarItem(indice, campo, valor) {
    setItems((prev) => prev.map((it, i) => (i === indice ? { ...it, [campo]: valor } : it)));
  }

  function agregarItem() {
    setItems((prev) => [...prev, itemVacio()]);
  }

  function quitarItem(indice) {
    setItems((prev) => prev.filter((_, i) => i !== indice));
  }

  const total = items.reduce((suma, it) => {
    const cantidad = Number(it.cantidad) || 0;
    const precio = Number(it.precio_unitario) || 0;
    return suma + cantidad * precio;
  }, 0);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    if (!clienteNombre.trim()) {
      setError("Escribe el nombre del cliente.");
      return;
    }
    const itemsValidos = items.filter((it) => it.descripcion.trim());
    if (itemsValidos.length === 0) {
      setError("Agrega al menos un producto o servicio.");
      return;
    }

    setGuardando(true);
    try {
      await api.crearFactura(negocioId, {
        cliente_nombre: clienteNombre.trim(),
        cliente_contacto: clienteContacto.trim() || undefined,
        fecha_vencimiento: fechaVencimiento || undefined,
        items: itemsValidos.map((it) => ({
          descripcion: it.descripcion.trim(),
          cantidad: Number(it.cantidad) || 1,
          precio_unitario: Number(it.precio_unitario) || 0,
        })),
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
      aria-labelledby="titulo-factura"
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
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "1.5rem",
          paddingBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 id="titulo-factura" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            Nueva factura
          </h2>
          <button onClick={onCerrar} aria-label="Cerrar" style={{ background: "none", border: "none", width: 32, height: 32 }}>
            <i className="ti ti-x" style={{ fontSize: 20, color: "var(--text-muted)" }} />
          </button>
        </div>

        <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="cliente" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
              Cliente
            </label>
            <input
              id="cliente"
              value={clienteNombre}
              onChange={(e) => elegirClienteExistente(e.target.value)}
              placeholder="Nombre del cliente"
              required
              list="clientes-guardados"
              style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15 }}
            />
            <datalist id="clientes-guardados">
              {clientesGuardados.map((c) => (
                <option key={c.id} value={c.nombre} />
              ))}
            </datalist>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="contacto" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
              Teléfono o correo (opcional)
            </label>
            <input
              id="contacto"
              value={clienteContacto}
              onChange={(e) => setClienteContacto(e.target.value)}
              placeholder="Ej. 300 123 4567"
              style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="vence-factura" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
              Fecha límite de pago (opcional)
            </label>
            <input
              id="vence-factura"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15 }}
            />
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", margin: "0 0 8px" }}>
              Productos o servicios
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, indice) => (
                <div
                  key={indice}
                  style={{
                    background: "var(--surface-1)",
                    borderRadius: "var(--radius-sm)",
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      value={item.descripcion}
                      onChange={(e) => actualizarItem(indice, "descripcion", e.target.value)}
                      placeholder="Descripción"
                      aria-label={`Descripción del ítem ${indice + 1}`}
                      style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid var(--border)", padding: "0 10px", fontSize: 14 }}
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => quitarItem(indice)}
                        aria-label={`Quitar ítem ${indice + 1}`}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--gasto-bg)", flexShrink: 0 }}
                      >
                        <i className="ti ti-trash" style={{ fontSize: 15, color: "var(--gasto)" }} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="number"
                      min="0.01"
                      step="1"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(indice, "cantidad", e.target.value)}
                      placeholder="Cantidad"
                      aria-label={`Cantidad del ítem ${indice + 1}`}
                      style={{ width: "35%", height: 40, borderRadius: 8, border: "1px solid var(--border)", padding: "0 10px", fontSize: 14, fontFamily: "var(--font-mono)" }}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.precio_unitario}
                      onChange={(e) => actualizarItem(indice, "precio_unitario", e.target.value)}
                      placeholder="Precio c/u"
                      aria-label={`Precio unitario del ítem ${indice + 1}`}
                      style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid var(--border)", padding: "0 10px", fontSize: 14, fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={agregarItem}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
                background: "none",
                border: "1px dashed var(--border-strong, var(--border))",
                borderRadius: "var(--radius-sm)",
                height: 40,
                width: "100%",
                justifyContent: "center",
                color: "var(--brand)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: 16 }} /> Agregar producto
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              background: "var(--surface-2)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600 }}>
              {formatoMoneda.format(total)}
            </span>
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
              background: "var(--ink-800)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              opacity: guardando ? 0.7 : 1,
            }}
          >
            {guardando ? "Guardando..." : "Crear factura"}
          </button>
        </form>
      </div>
    </div>
  );
}
