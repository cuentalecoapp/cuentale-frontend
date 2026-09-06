// Genera una factura imprimible (con el logo y datos del negocio) que se abre
// en una ventana nueva lista para imprimir o guardar como PDF.
// Aprovecha los datos del negocio que el usuario guardó en Ajustes.

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function fechaLegible(valor) {
  if (!valor) return "-";
  const d = new Date(valor);
  if (isNaN(d.getTime())) return String(valor);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Recibe el detalle de la factura (con datos del negocio incluidos) y la muestra
export function imprimirFactura(factura) {
  const items = factura.items || [];

  // Logo: si el negocio subió uno, lo mostramos; si no, mostramos el nombre grande
  const logoHtml = factura.negocio_logo
    ? `<img src="${factura.negocio_logo}" alt="Logo" style="max-height:70px; max-width:180px; object-fit:contain;" />`
    : `<div style="font-size:26px; font-weight:800; color:#128C6E;">${factura.negocio_nombre || "Mi Negocio"}</div>`;

  // Datos de contacto del negocio (solo los que existan)
  const datosNegocio = [];
  if (factura.negocio_nit) datosNegocio.push(`NIT/CC: ${factura.negocio_nit}`);
  if (factura.negocio_direccion) datosNegocio.push(factura.negocio_direccion);
  if (factura.negocio_ciudad) datosNegocio.push(factura.negocio_ciudad);
  if (factura.negocio_telefono) datosNegocio.push(`Tel: ${factura.negocio_telefono}`);
  if (factura.negocio_correo) datosNegocio.push(factura.negocio_correo);

  // Filas de los productos/servicios
  const filasItems = items.length
    ? items
        .map((it) => {
          const cant = Number(it.cantidad) || 1;
          const precio = Number(it.precio_unitario) || 0;
          const subtotal = cant * precio;
          return `<tr>
            <td style="padding:10px 8px; border-bottom:1px solid #eee;">${it.descripcion || "-"}</td>
            <td style="padding:10px 8px; border-bottom:1px solid #eee; text-align:center;">${cant}</td>
            <td style="padding:10px 8px; border-bottom:1px solid #eee; text-align:right;">${formatoMoneda.format(precio)}</td>
            <td style="padding:10px 8px; border-bottom:1px solid #eee; text-align:right;">${formatoMoneda.format(subtotal)}</td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="4" style="padding:14px 8px; text-align:center; color:#888;">Sin ítems detallados</td></tr>`;

  const estadoTexto = { pendiente: "PENDIENTE", pagada: "PAGADA", anulada: "ANULADA" }[factura.estado] || factura.estado;
  const estadoColor = { pendiente: "#E8A33D", pagada: "#128C6E", anulada: "#C0341A" }[factura.estado] || "#6E6258";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura N° ${factura.numero} — ${factura.negocio_nombre || ""}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI', Arial, sans-serif; color:#2A2320; padding:40px; max-width:800px; margin:0 auto; }
  .cabecera { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #128C6E; padding-bottom:20px; margin-bottom:24px; }
  .negocio-datos { font-size:13px; color:#6E6258; line-height:1.6; margin-top:8px; }
  .factura-titulo { text-align:right; }
  .factura-titulo h1 { font-size:28px; color:#128C6E; letter-spacing:1px; }
  .factura-num { font-size:15px; color:#2A2320; margin-top:4px; font-weight:600; }
  .estado { display:inline-block; margin-top:8px; padding:4px 14px; border-radius:999px; color:#fff; font-size:12px; font-weight:700; background:${estadoColor}; }
  .info-cliente { display:flex; justify-content:space-between; margin-bottom:24px; font-size:14px; }
  .info-cliente .bloque strong { display:block; color:#128C6E; font-size:12px; text-transform:uppercase; margin-bottom:4px; }
  table { width:100%; border-collapse:collapse; margin-bottom:8px; }
  th { background:#128C6E; color:#fff; padding:10px 8px; text-align:left; font-size:13px; }
  th:nth-child(2){ text-align:center; } th:nth-child(3),th:nth-child(4){ text-align:right; }
  .total-caja { display:flex; justify-content:flex-end; margin-top:16px; }
  .total-caja .total { background:#DBF3EC; border-radius:12px; padding:16px 28px; text-align:right; }
  .total-caja .total .label { font-size:13px; color:#6E6258; }
  .total-caja .total .monto { font-size:26px; font-weight:800; color:#128C6E; }
  .notas { margin-top:24px; padding:14px; background:#FFF8F0; border-radius:10px; font-size:13px; color:#6E6258; }
  .pie { margin-top:40px; text-align:center; font-size:12px; color:#A89C8E; border-top:1px solid #eee; padding-top:16px; }
  .boton-imprimir { display:block; margin:20px auto 0; background:#FF6A2B; color:#fff; border:none; padding:12px 30px; border-radius:999px; font-size:15px; font-weight:700; cursor:pointer; }
  @media print { .boton-imprimir { display:none; } body { padding:20px; } }
</style>
</head>
<body>
  <div class="cabecera">
    <div>
      ${logoHtml}
      <div class="negocio-datos">${datosNegocio.join("<br>")}</div>
    </div>
    <div class="factura-titulo">
      <h1>FACTURA</h1>
      <div class="factura-num">N° ${String(factura.numero).padStart(4, "0")}</div>
      <div class="estado">${estadoTexto}</div>
    </div>
  </div>

  <div class="info-cliente">
    <div class="bloque">
      <strong>Cliente</strong>
      ${factura.cliente_nombre || "-"}<br>
      ${factura.cliente_contacto || ""}
    </div>
    <div class="bloque" style="text-align:right;">
      <strong>Fecha</strong>
      ${fechaLegible(factura.fecha)}
      ${factura.fecha_vencimiento ? `<br><strong style="margin-top:8px;">Vence</strong>${fechaLegible(factura.fecha_vencimiento)}` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
    </thead>
    <tbody>${filasItems}</tbody>
  </table>

  <div class="total-caja">
    <div class="total">
      <div class="label">TOTAL A PAGAR</div>
      <div class="monto">${formatoMoneda.format(Number(factura.total) || 0)}</div>
    </div>
  </div>

  ${factura.notas ? `<div class="notas"><strong>Notas:</strong> ${factura.notas}</div>` : ""}

  <div class="pie">
    Generado con Cuéntale · Tu negocio, claro
  </div>

  <button class="boton-imprimir" onclick="window.print()">🖨️ Imprimir o guardar como PDF</button>
</body>
</html>`;

  // Abrimos la factura en una ventana nueva
  const ventana = window.open("", "_blank");
  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();
  } else {
    alert("Permite las ventanas emergentes para ver la factura.");
  }
}
