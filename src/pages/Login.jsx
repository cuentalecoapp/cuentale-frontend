import { useState } from "react";
import { api } from "../api.js";
import { SimboloCuentale } from "../components/Logo.jsx";
import fondoLogin from "../assets/login-fondo.jpg";

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // confirmar contraseña
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [verPassword, setVerPassword] = useState(false); // mostrar/ocultar
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Valida que la contraseña sea fuerte (al menos 8 caracteres, con letra y número)
  function validarPassword(pass) {
    if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[a-zA-Z]/.test(pass)) return "La contraseña debe tener al menos una letra.";
    if (!/[0-9]/.test(pass)) return "La contraseña debe tener al menos un número.";
    return null;
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    // Validaciones extra solo al registrarse
    if (modo === "registro") {
      const errorPass = validarPassword(password);
      if (errorPass) {
        setError(errorPass);
        return;
      }
      if (password !== password2) {
        setError("Las contraseñas no coinciden. Verifícalas.");
        return;
      }
      if (!aceptaTerminos) {
        setError("Debes aceptar los Términos y la Política de Datos para continuar.");
        return;
      }
    }

    setCargando(true);
    try {
      const resultado =
        modo === "login"
          ? await api.login(correo, password)
          : await api.registro(nombre, correo, password);

      api.guardarSesion(resultado.token);
      onEntrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiarModo() {
    setError("");
    setPassword("");
    setPassword2("");
    setAceptaTerminos(false);
    setModo(modo === "login" ? "registro" : "login");
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
        <h1 className="nombre-flotante" style={{ fontSize: 38, fontWeight: 900, margin: "0 0 8px", color: "#128C6E", letterSpacing: "-0.5px", textShadow: "1px 1px 0 #0C6A52, 2px 2px 0 rgba(12,106,82,0.5), 3px 4px 6px rgba(0,0,0,0.25)" }}>Cuéntale</h1>
        <div style={{ display: "inline-block", background: "var(--amarillo)", borderRadius: 20, padding: "5px 16px", marginTop: 4, boxShadow: "0 4px 12px rgba(232,163,61,0.4)" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#7a4a00", margin: 0, letterSpacing: "1.5px", textShadow: "0 1px 1px rgba(255,255,255,0.4)" }}>TU NEGOCIO, CLARO</p>
        </div>
      </div>

      <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {modo === "registro" && (
          <Campo label="Tu nombre" value={nombre} onChange={setNombre} type="text" autoComplete="name" required />
        )}
        <Campo label="Correo" value={correo} onChange={setCorreo} type="email" autoComplete="email" required />

        {/* Contraseña con ojito para mostrar/ocultar */}
        <CampoPassword
          label="Contraseña"
          value={password}
          onChange={setPassword}
          ver={verPassword}
          setVer={setVerPassword}
          autoComplete={modo === "login" ? "current-password" : "new-password"}
        />

        {/* Confirmar contraseña (solo al registrarse) */}
        {modo === "registro" && (
          <CampoPassword
            label="Confirmar contraseña"
            value={password2}
            onChange={setPassword2}
            ver={verPassword}
            setVer={setVerPassword}
            autoComplete="new-password"
          />
        )}

        {/* Pista de requisitos de contraseña al registrarse */}
        {modo === "registro" && (
          <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: "-4px 0 0" }}>
            Mínimo 8 caracteres, con al menos una letra y un número.
          </p>
        )}

        {/* Casilla de términos (solo al registrarse) */}
        {modo === "registro" && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--text)", cursor: "pointer", marginTop: 2 }}>
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: "var(--naranja)" }}
            />
            <span>
              Acepto los{" "}
              <a
                href="https://cuentale-web.onrender.com/terminos.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--brand)", fontWeight: 700 }}
                onClick={(e) => e.stopPropagation()}
              >
                Términos y Condiciones
              </a>{" "}
              y la{" "}
              <a
                href="https://cuentale-web.onrender.com/datos.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--brand)", fontWeight: 700 }}
                onClick={(e) => e.stopPropagation()}
              >
                Política de Tratamiento de Datos
              </a>.
            </span>
          </label>
        )}

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
          {cargando ? "Un momento..." : modo === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={cambiarModo}
        style={{
          background: "none",
          border: "none",
          color: "var(--brand)",
          fontSize: 14,
          fontWeight: 500,
          marginTop: 16,
          textAlign: "center",
        }}
      >
        {modo === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
      </button>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, type, autoComplete, required }) {
  const id = `campo-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        style={{
          height: 50,
          borderRadius: "var(--radius-md)",
          border: "none",
          padding: "0 16px",
          fontSize: 15,
          background: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
        }}
      />
    </div>
  );
}

// Campo de contraseña con botón de ojito para mostrar/ocultar
function CampoPassword({ label, value, onChange, ver, setVer, autoComplete }) {
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
          autoComplete={autoComplete}
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
