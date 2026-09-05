import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import ConfirmarBorrado from "../components/ConfirmarBorrado.jsx";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function ProductoModal({ negocioId, onCerrar, onGuardado }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError("");
    setGuardando(true);
    try {
      await api.crearProducto(negocioId, {
        nombre: nombre.trim(),
        precio_venta: Number(precio) || 0,
        stock_actual: Number(stock) || 0,
        stock_minimo: Number(stockMinimo) || 0,
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
      aria-labelledby="titulo-producto"
      style={{ position: "fixed", inset: 0, background: "rgba(22,20,58,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}
      onClick={onCerrar}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "var(--surface-0)", borderRadius: "20px 20px 0 0", padding: "1.5rem", paddingBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 id="titulo-producto" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Nuevo producto</h2>
          <button onClick={onCerrar} aria-label="Cerrar" style={{ background: "none", border: "none", width: 32, height: 32 }}>
            <i className="ti ti-x" style={{ fontSize: 20, color: "var(--text-muted)" }} />
          </button>
        </div>

        <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="nombre-producto" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Nombre</label>
            <input id="nombre-producto" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Pan francés" required
              style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15 }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="precio-producto" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Precio de venta</label>
              <input id="precio-producto" type="number" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0"
                style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15, fontFamily: "var(--font-mono)" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="stock-producto" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Stock inicial</label>
              <input id="stock-producto" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0"
                style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15, fontFamily: "var(--font-mono)" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="stock-minimo" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
              Avisarme cuando queden menos de
            </label>
            <input id="stock-minimo" type="number" min="0" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} placeholder="Ej. 5"
              style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15, fontFamily: "var(--font-mono)" }} />
          </div>

          {error && <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={guardando} style={{ height: 50, borderRadius: "var(--radius-md)", border: "none", background: "var(--ink-800)", color: "#fff", fontSize: 15, fontWeight: 600, opacity: guardando ? 0.7 : 1 }}>
            {guardando ? "Guardando..." : "Agregar producto"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Inventario({ negocioId }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ajustando, setAjustando] = useState(null);
  const [borrarId, setBorrarId] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setProductos(await api.listarProductos(negocioId));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [negocioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function ajustar(productoId, cantidad) {
    setAjustando(productoId);
    try {
      await api.ajustarStock(negocioId, productoId, cantidad);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setAjustando(null);
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
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Inventario</h1>
        <button
          onClick={() => setModalAbierto(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, height: 40, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--ink-800)", color: "#fff", fontSize: 14, fontWeight: 500 }}
        >
          <i className="ti ti-plus" style={{ fontSize: 16 }} /> Producto
        </button>
      </div>

      {error && <p role="alert" style={{ color: "var(--gasto)", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      {cargando ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando inventario…</p>
      ) : productos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: 14 }}>
          <i className="ti ti-box" style={{ fontSize: 32, display: "block", margin: "0 auto 10px" }} />
          Aún no tienes productos. Agrega el primero.
        </div>
      ) : (
        <ul className="lista-anim" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {productos.map((p) => {
            const bajoStock = p.stock_minimo > 0 && Number(p.stock_actual) <= Number(p.stock_minimo);
            return (
              <li key={p.id} style={{ background: "var(--surface-1)", borderRadius: "var(--radius-md)", padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{p.nombre}</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "2px 0 0", fontFamily: "var(--font-mono)" }}>
                      {formatoMoneda.format(p.precio_venta)}
                    </p>
                  </div>
                  {bajoStock && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "var(--gasto-bg)", color: "var(--gasto)", whiteSpace: "nowrap" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: 12 }} /> Stock bajo
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14 }}>
                    Stock: <strong style={{ fontFamily: "var(--font-mono)" }}>{p.stock_actual}</strong>
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => ajustar(p.id, -1)}
                      disabled={ajustando === p.id}
                      aria-label={`Quitar una unidad de ${p.nombre}`}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-0)" }}
                    >
                      −
                    </button>
                    <button
                      onClick={() => ajustar(p.id, 1)}
                      disabled={ajustando === p.id}
                      aria-label={`Agregar una unidad de ${p.nombre}`}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-0)" }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => setBorrarId(p.id)}
                      aria-label={`Borrar ${p.nombre}`}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--gasto-bg)", color: "var(--gasto)", marginLeft: 4 }}
                    >
                      <i className="ti ti-trash" style={{ fontSize: 15 }} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalAbierto && <ProductoModal negocioId={negocioId} onCerrar={() => setModalAbierto(false)} onGuardado={manejarGuardado} />}

      {borrarId && (
        <ConfirmarBorrado
          mensaje="Se eliminará este producto de tu inventario."
          onConfirmar={async () => {
            await api.eliminarProducto(negocioId, borrarId);
            setBorrarId(null);
            setCargando(true);
            cargar();
          }}
          onCancelar={() => setBorrarId(null)}
        />
      )}
    </div>
  );
}
