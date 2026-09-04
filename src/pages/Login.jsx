import { useState } from "react";
import { api } from "../api.js";
import { SimboloCuentale } from "../components/Logo.jsx";
import fondoLogin from "../assets/login-fondo.jpg";

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem",
        // Foto de fondo con una capa oscura degradada encima para que se lea el formulario
        backgroundImage: `linear-gradient(to bottom, rgba(12,106,82,0.55), rgba(20,20,20,0.75)), url(${fondoLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Tarjeta blanca flotante con el formulario */}
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
          <Campo
            label="Tu nombre"
            value={nombre}
            onChange={setNombre}
            type="text"
            autoComplete="name"
            required
          />
        )}
        <Campo
          label="Correo"
          value={correo}
          onChange={setCorreo}
          type="email"
          autoComplete="email"
          required
        />
        <Campo
          label="Contraseña"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete={modo === "login" ? "current-password" : "new-password"}
          required
        />

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
        onClick={() => {
          setError("");
          setModo(modo === "login" ? "registro" : "login");
        }}
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
