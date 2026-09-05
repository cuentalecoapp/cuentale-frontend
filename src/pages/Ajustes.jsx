import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import InterruptorTema from "../components/InterruptorTema.jsx";

// Rubros comunes para que el emprendedor elija (conecta con la idea de cursos por área)
const RUBROS = [
  "Restaurante / Comida",
  "Tienda / Minimercado",
  "Ropa / Calzado",
  "Belleza / Peluquería",
  "Ferretería",
  "Farmacia / Droguería",
  "Servicios profesionales",
  "Papelería",
  "Tecnología",
  "Otro",
];

export default function Ajustes({ negocioId }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const perfil = await api.perfilNegocio(negocioId);
      setDatos(perfil);
    } catch (err) {
      setError("No pudimos cargar la información del negocio.");
    } finally {
      setCargando(false);
    }
  }, [negocioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setExito("");
  }

  // Al subir un logo, lo convertimos a texto (base64) para guardarlo
  function manejarLogo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar que sea imagen y no muy pesada (máx 500 KB para no saturar)
    if (!archivo.type.startsWith("image/")) {
      setError("El logo debe ser una imagen (PNG o JPG).");
      return;
    }
    if (archivo.size > 500 * 1024) {
      setError("El logo es muy pesado. Usa una imagen de menos de 500 KB.");
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      actualizar("logo", lector.result);
      setError("");
    };
    lector.readAsDataURL(archivo);
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setExito("");
    if (!datos.nombre || !datos.nombre.trim()) {
      setError("El nombre del negocio es obligatorio.");
      return;
    }
    setGuardando(true);
    try {
      await api.actualizarPerfil(negocioId, datos);
      setExito("¡Listo! Los datos de tu negocio quedaron guardados.");
    } catch (err) {
      setError("No pudimos guardar los cambios. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <div style={{ padding: "1.5rem" }}><p style={{ color: "var(--text-secondary)" }}>Cargando…</p></div>;
  }

  if (!datos) {
    return <div style={{ padding: "1.5rem" }}><p style={{ color: "var(--gasto)" }}>{error || "No se pudo cargar."}</p></div>;
  }

  const estiloCampo = {
    height: 46,
    borderRadius: "var(--radius-md)",
    border: "none",
    padding: "0 14px",
    fontSize: 15,
    background: "#fff",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    width: "100%",
  };
  const estiloEtiqueta = { fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6, display: "block" };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Configuración</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 1.5rem" }}>
        Los datos de tu negocio aparecerán en tus reportes y facturas.
      </p>

      {/* Interruptor de tema claro/oscuro */}
      <InterruptorTema />

      <form onSubmit={guardar}>
        {/* Logo */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.10)", textAlign: "center" }}>
          <label style={estiloEtiqueta}>Logo de tu negocio</label>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 96, height: 96, borderRadius: 20, background: datos.logo ? "transparent" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid var(--border)" }}>
              {datos.logo ? (
                <img src={datos.logo} alt="Logo del negocio" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <i className="ti ti-photo" style={{ fontSize: 34, color: "var(--text-muted)" }} />
              )}
            </div>
            <label style={{ cursor: "pointer", background: "var(--brand-light)", color: "var(--brand)", fontWeight: 700, fontSize: 13, padding: "8px 16px", borderRadius: 999 }}>
              {datos.logo ? "Cambiar logo" : "Subir logo"}
              <input type="file" accept="image/*" onChange={manejarLogo} style={{ display: "none" }} />
            </label>
            {datos.logo && (
              <button type="button" onClick={() => actualizar("logo", null)} style={{ border: "none", background: "none", color: "var(--gasto)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Quitar logo
              </button>
            )}
          </div>
        </div>

        {/* Datos del negocio */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={estiloEtiqueta}>Nombre del negocio *</label>
            <input value={datos.nombre || ""} onChange={(e) => actualizar("nombre", e.target.value)} style={estiloCampo} placeholder="Ej: Pugliapizza" />
          </div>
          <div>
            <label style={estiloEtiqueta}>NIT o Cédula</label>
            <input value={datos.nit || ""} onChange={(e) => actualizar("nit", e.target.value)} style={estiloCampo} placeholder="Ej: 900.123.456-7" />
          </div>
          <div>
            <label style={estiloEtiqueta}>¿Qué tipo de negocio es?</label>
            <select value={datos.rubro || ""} onChange={(e) => actualizar("rubro", e.target.value)} style={{ ...estiloCampo, appearance: "auto" }}>
              <option value="">Selecciona…</option>
              {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Contacto */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "var(--text)" }}>Contacto y ubicación</p>
          <div>
            <label style={estiloEtiqueta}>Teléfono</label>
            <input value={datos.telefono || ""} onChange={(e) => actualizar("telefono", e.target.value)} style={estiloCampo} placeholder="Ej: 300 123 4567" />
          </div>
          <div>
            <label style={estiloEtiqueta}>Correo del negocio</label>
            <input type="email" value={datos.correo || ""} onChange={(e) => actualizar("correo", e.target.value)} style={estiloCampo} placeholder="Ej: hola@minegocio.com" />
          </div>
          <div>
            <label style={estiloEtiqueta}>Dirección</label>
            <input value={datos.direccion || ""} onChange={(e) => actualizar("direccion", e.target.value)} style={estiloCampo} placeholder="Ej: Calle 10 #5-20" />
          </div>
          <div>
            <label style={estiloEtiqueta}>Ciudad</label>
            <input value={datos.ciudad || ""} onChange={(e) => actualizar("ciudad", e.target.value)} style={estiloCampo} placeholder="Ej: Cali" />
          </div>
        </div>

        {error && <p style={{ color: "var(--gasto)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {exito && <p style={{ color: "var(--ingreso)", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{exito}</p>}

        <button
          type="submit"
          disabled={guardando}
          style={{
            width: "100%",
            height: 50,
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--brand)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            boxShadow: "0 6px 18px rgba(127,119,221,0.4)",
            opacity: guardando ? 0.7 : 1,
            cursor: "pointer",
          }}
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
