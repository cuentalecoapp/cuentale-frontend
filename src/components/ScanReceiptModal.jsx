import { useRef, useState } from "react";
import { api } from "../api.js";

// Busca en el texto reconocido el número que más se parece a un monto en pesos
// (con separadores de miles) y se queda con el más grande, que casi siempre es el total.
function detectarMonto(texto) {
  const coincidencias = texto.match(/\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?/g) || [];
  const numeros = coincidencias
    .map((m) => Number(m.replace(/\./g, "").replace(",", ".")))
    .filter((n) => !Number.isNaN(n) && n > 0);
  return numeros.length ? Math.max(...numeros) : null;
}

export default function ScanReceiptModal({ negocioId, onCerrar, onGuardado }) {
  const [imagen, setImagen] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [textoDetectado, setTextoDetectado] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const inputRef = useRef(null);

  async function manejarArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError("");
    setImagen(URL.createObjectURL(archivo));
    setProcesando(true);
    setProgreso(0);

    try {
      const Tesseract = await import("tesseract.js");
      const resultado = await Tesseract.recognize(archivo, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") setProgreso(Math.round(m.progress * 100));
        },
      });

      const texto = resultado.data.text;
      setTextoDetectado(texto);

      const montoDetectado = detectarMonto(texto);
      if (montoDetectado) setMonto(String(Math.round(montoDetectado)));

      // Primera línea con texto real como sugerencia de descripción (suele ser el nombre del negocio/proveedor)
      const primeraLinea = texto.split("\n").map((l) => l.trim()).find((l) => l.length > 3);
      if (primeraLinea) setDescripcion(primeraLinea.slice(0, 60));
    } catch (err) {
      setError("No se pudo leer la imagen. Puedes escribir el monto manualmente.");
    } finally {
      setProcesando(false);
    }
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    if (!monto || Number(monto) <= 0) {
      setError("Escribe un monto mayor a cero.");
      return;
    }
    if (!descripcion.trim()) {
      setError("Escribe una breve descripción.");
      return;
    }

    setGuardando(true);
    try {
      await api.crearTransaccion(negocioId, {
        tipo: "gasto",
        monto: Number(monto),
        descripcion: descripcion.trim(),
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
      aria-labelledby="titulo-escaner"
      style={{ position: "fixed", inset: 0, background: "rgba(22,20,58,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}
      onClick={onCerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", background: "var(--surface-0)", borderRadius: "20px 20px 0 0", padding: "1.5rem", paddingBottom: "2rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 id="titulo-escaner" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Escanear recibo</h2>
          <button onClick={onCerrar} aria-label="Cerrar" style={{ background: "none", border: "none", width: 32, height: 32 }}>
            <i className="ti ti-x" style={{ fontSize: 20, color: "var(--text-muted)" }} />
          </button>
        </div>

        {!imagen ? (
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              width: "100%",
              height: 160,
              borderRadius: "var(--radius-md)",
              border: "2px dashed var(--border)",
              background: "var(--surface-1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "var(--text-secondary)",
            }}
          >
            <i className="ti ti-camera" style={{ fontSize: 32 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Tomar foto o elegir imagen</span>
          </button>
        ) : (
          <img src={imagen} alt="Recibo escaneado" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: "var(--radius-md)", marginBottom: 16, background: "var(--surface-1)" }} />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={manejarArchivo}
          style={{ display: "none" }}
        />

        {procesando && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", margin: "16px 0" }}>
            Leyendo el recibo… {progreso}%
          </p>
        )}

        {imagen && !procesando && (
          <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="monto-escaneo" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                Monto {textoDetectado && "(detectado automáticamente, revísalo)"}
              </label>
              <input
                id="monto-escaneo"
                type="number"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15, fontFamily: "var(--font-mono)" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="desc-escaneo" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                Descripción
              </label>
              <input
                id="desc-escaneo"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ height: 46, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 14px", fontSize: 15 }}
              />
            </div>

            {error && <p role="alert" style={{ color: "var(--gasto)", fontSize: 13, margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={guardando}
              style={{ height: 50, borderRadius: "var(--radius-md)", border: "none", background: "var(--gasto)", color: "#fff", fontSize: 15, fontWeight: 600, opacity: guardando ? 0.7 : 1 }}
            >
              {guardando ? "Guardando..." : "Registrar como gasto"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
