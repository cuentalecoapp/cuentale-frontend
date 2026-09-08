import { useState } from "react";
import { api } from "../api.js";
import { SimboloCuentale } from "../components/Logo.jsx";
import fondoLogin from "../assets/login-fondo.jpg";

// Pantalla a la que llega el usuario al hacer clic en el enlace del correo de recuperación.
// Recibe el "token" (código secreto) que venía en el enlace.
export default function RestablecerPassword({ token, onListo }) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  function validarPassword(pass) {
    if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[a-zA-Z]/.test(pass)) return "La contraseña debe tener al menos una letra.";
    if (!/[0-9]/.test(pass)) return "La contraseña debe tener al menos un número.";
    return null;
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    const errorPass = validarPassword(password);
    if (errorPass) {
      setError(errorPass);
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden. Verifícalas.");
      return;
    }

    setCargando(true);
    try {
      await api.restablecerPassword(token, password);
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem",
        backgroundImage: `linear-gradient(to bottom, rgba(12,106,82,0.55), rgba(20,20,20,0.75)), url(${fondoLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="login-shell aparece"
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(255,255,255,0.97)",
          borderRadius: 24,
          padding: "2rem 1.75rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div className="logo-flotante" style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <SimboloCuentale tamano={88} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px", color: "#128C6E" }}>Nueva contraseña</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>
            Escribe tu contraseña nueva para Cuéntale.
          </p>
        </div>

        {exito ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 20 }}>
              ¡Listo! Ya puedes iniciar sesión con tu contraseña nueva.
            </p>
            <button
              onClick={onListo}
              style={{
                height: 52,
                width: "100%",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--naranja)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                boxShadow: "0 6px 18px rgba(255,106,43,0.45)",
              }}
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <CampoPassword label="Contraseña nueva" value={password} onChange={setPassword} ver={verPassword} setVer={setVerPassword} />
            <CampoPassword label="Confirmar contraseña" value={password2} onChange={setPassword2} ver={verPassword} setVer={setVerPassword} />
            <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: "-4px 0 0" }}>
              Mínimo 8 caracteres, con al menos una letra y un número.
            </p>

            {error && (
              <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                height: 52,
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--naranja)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                marginTop: 8,
                boxShadow: "0 6px 18px rgba(255,106,43,0.45)",
                opacity: cargando ? 0.7 : 1,
              }}
            >
              {cargando ? "Guardando..." : "Guardar contraseña nueva"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CampoPassword({ label, value, onChange, ver, setVer }) {
  const id = `campo-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={ver ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          required
          style={{
            height: 50,
            width: "100%",
            borderRadius: "var(--radius-md)",
            border: "none",
            padding: "0 48px 0 16px",
            fontSize: 15,
            background: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setVer(!ver)}
          aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            padding: 6,
            lineHeight: 1,
          }}
        >
          {ver ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}
