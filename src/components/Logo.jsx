// Logo de Cuéntale como componente reutilizable.
// 'tamano' controla el diámetro del símbolo; 'conTexto' muestra el nombre al lado.

export function SimboloCuentale({ tamano = 48 }) {
  return (
    <svg
      width={tamano}
      height={tamano * 1.15}
      viewBox="0 0 116 134"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", filter: "drop-shadow(2px 3px 3px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <radialGradient id="globoGrad" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FF8348" />
          <stop offset="100%" stopColor="#E85410" />
        </radialGradient>
      </defs>
      <circle cx="58" cy="58" r="54" fill="url(#globoGrad)" />
      <circle cx="58" cy="58" r="54" fill="none" stroke="#C0341A" strokeWidth="3" />
      <circle cx="58" cy="58" r="43" fill="none" stroke="#FFD34E" strokeWidth="3" strokeDasharray="3 5.5" strokeLinecap="round" />
      <path d="M18 86 L9 118 L46 88 Z" fill="#E85410" />
      <path d="M18 86 L9 118 L46 88 Z" fill="none" stroke="#C0341A" strokeWidth="3" strokeLinejoin="round" />
      {/* recibo */}
      <path d="M34 32 h48 v50 l-7 -5 -7 5 -7 -5 -7 5 -7 -5 -6 5 Z" fill="#FFF3D6" />
      <text x="58" y="58" textAnchor="middle" style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, fill: "#128C6E" }}>$</text>
      <rect x="42" y="64" width="30" height="3" rx="1.5" fill="#FF6A2B" />
      <rect x="42" y="71" width="20" height="3" rx="1.5" fill="#FFD34E" />
    </svg>
  );
}

export default function Logo({ tamano = 40, oscuro = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <SimboloCuentale tamano={tamano} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "Nunito, sans-serif",
            fontSize: tamano * 0.62,
            fontWeight: 900,
            color: oscuro ? "#FFFFFF" : "#128C6E",
            letterSpacing: "-0.5px",
            textShadow: oscuro
              ? "1px 1px 0 rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.35)"
              : "1px 1px 0 #0C6A52, 2px 2px 0 rgba(12,106,82,0.5), 2px 3px 5px rgba(0,0,0,0.25)",
          }}
        >
          Cuéntale
        </span>
      </div>
    </div>
  );
}
