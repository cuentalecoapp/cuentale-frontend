// Genera el reporte contable para el contador como un archivo Excel (.xlsx) REAL,
// usando la librería SheetJS. Abre en Excel sin ningún aviso, con las fechas
// legibles, los montos como números (para sumar/filtrar), y con formato visual.

import * as XLSX from "xlsx";

// Convierte una fecha (ej. 2026-08-14T05:00:00.000Z) a texto legible: 14/08/2026
function fechaLegible(valor) {
  if (!valor) return "-";
  const d = new Date(valor);
  if (isNaN(d.getTime())) return String(valor);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function estadoLegible(estado) {
  const mapa = { pendiente: "Pendiente", pagada: "Pagada", anulada: "Anulada" };
  return mapa[estado] || estado || "-";
}

export function exportarExcelContable(datos) {
  const { negocio, negocioInfo, movimientos, facturas, cuentasPorPagar } = datos;
  const info = negocioInfo || {};

  const ingresos = movimientos.filter((m) => m.tipo === "ingreso");
  const gastos = movimientos.filter((m) => m.tipo === "gasto");
  const totalIngresos = ingresos.reduce((s, m) => s + Number(m.monto), 0);
  const totalGastos = gastos.reduce((s, m) => s + Number(m.monto), 0);
  const saldo = totalIngresos - totalGastos;

  const facturasPendientes = facturas.filter((f) => f.estado === "pendiente");
  const totalPorCobrar = facturasPendientes.reduce((s, f) => s + Number(f.total), 0);
  const cuentasPendientes = cuentasPorPagar.filter((c) => c.estado === "pendiente");
  const totalPorPagar = cuentasPendientes.reduce((s, c) => s + Number(c.monto), 0);

  // Construimos la hoja como una matriz de filas (AOA: array of arrays)
  const filas = [];

  // Encabezado con el nombre y los datos del negocio (para que salga con SU marca)
  filas.push([negocio, "", "", "", "", ""]);
  // Línea con NIT/cédula y teléfono si existen
  const linea2 = [];
  if (info.nit) linea2.push(`NIT/CC: ${info.nit}`);
  if (info.telefono) linea2.push(`Tel: ${info.telefono}`);
  if (linea2.length) filas.push([linea2.join("   ·   "), "", "", "", "", ""]);
  // Línea con dirección, ciudad y correo si existen
  const linea3 = [];
  if (info.direccion) linea3.push(info.direccion);
  if (info.ciudad) linea3.push(info.ciudad);
  if (info.correo) linea3.push(info.correo);
  if (linea3.length) filas.push([linea3.join("   ·   "), "", "", "", "", ""]);
  filas.push(["Reporte contable · Generado el " + fechaLegible(new Date()), "", "", "", "", ""]);
  filas.push([]);

  // RESUMEN EJECUTIVO (panorama rápido para el contador)
  filas.push(["RESUMEN GENERAL", "", "", "", "", ""]);
  filas.push(["Total ingresos", "", "", "", "", totalIngresos]);
  filas.push(["Total gastos", "", "", "", "", totalGastos]);
  filas.push(["Saldo (ingresos - gastos)", "", "", "", "", saldo]);
  filas.push(["Por cobrar (facturas pendientes)", "", "", "", "", totalPorCobrar]);
  filas.push(["Por pagar (cuentas pendientes)", "", "", "", "", totalPorPagar]);
  filas.push(["Cantidad de movimientos: " + movimientos.length, "", "", "", "", ""]);
  filas.push(["", "", "", "", "", ""]);

  // Sección 1: Movimientos
  filas.push(["MOVIMIENTOS (INGRESOS Y GASTOS)", "", "", "", "", ""]);
  filas.push(["Fecha", "Tipo", "Categoría", "Descripción", "", "Monto"]);
  for (const m of movimientos) {
    filas.push([
      fechaLegible(m.fecha),
      m.tipo === "ingreso" ? "Ingreso" : "Gasto",
      m.categoria || "Sin categoría",
      m.descripcion || "-",
      "",
      Number(m.monto) || 0,
    ]);
  }
  filas.push(["Total ingresos", "", "", "", "", totalIngresos]);
  filas.push(["Total gastos", "", "", "", "", totalGastos]);
  filas.push(["Saldo", "", "", "", "", saldo]);
  filas.push([]);

  // Sección 2: Facturas (cuentas por cobrar) — ahora con fecha de emisión y contacto
  filas.push(["FACTURAS (CUENTAS POR COBRAR)", "", "", "", "", ""]);
  filas.push(["N°", "Cliente", "Contacto", "Emitida", "Vence", "Total"]);
  if (facturas.length === 0) {
    filas.push(["Sin facturas registradas", "", "", "", "", ""]);
  } else {
    let totalCobrar = 0;
    for (const f of facturas) {
      totalCobrar += Number(f.total);
      filas.push([
        f.numero,
        f.cliente_nombre || "-",
        f.cliente_contacto || "-",
        fechaLegible(f.fecha),
        fechaLegible(f.fecha_vencimiento),
        Number(f.total),
      ]);
    }
    filas.push(["Total facturado", "", "", "", "", totalCobrar]);
  }
  filas.push([]);

  // Sección 3: Cuentas por pagar
  filas.push(["CUENTAS POR PAGAR", "", "", "", "", ""]);
  filas.push(["Proveedor", "Concepto", "", "Estado", "Vence", "Monto"]);
  if (cuentasPorPagar.length === 0) {
    filas.push(["Sin cuentas por pagar registradas", "", "", "", "", ""]);
  } else {
    let totalPagar = 0;
    for (const c of cuentasPorPagar) {
      totalPagar += Number(c.monto);
      filas.push([
        c.proveedor_nombre,
        c.concepto,
        "",
        estadoLegible(c.estado),
        fechaLegible(c.fecha_vencimiento),
        Number(c.monto),
      ]);
    }
    filas.push(["Total por pagar", "", "", "", "", totalPagar]);
  }

  // Creamos la hoja
  const hoja = XLSX.utils.aoa_to_sheet(filas);

  // Ancho de columnas (6 columnas: A-F)
  hoja["!cols"] = [
    { wch: 20 }, // A
    { wch: 18 }, // B
    { wch: 16 }, // C
    { wch: 20 }, // D
    { wch: 12 }, // E
    { wch: 14 }, // F (montos)
  ];

  // Formato de moneda a la columna de montos (columna F = índice 5)
  const rango = XLSX.utils.decode_range(hoja["!ref"]);
  for (let fila = 0; fila <= rango.e.r; fila++) {
    const celda = hoja[XLSX.utils.encode_cell({ r: fila, c: 5 })];
    if (celda && typeof celda.v === "number") {
      celda.z = '"$"#,##0';
    }
  }

  // Creamos el libro y descargamos
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
  XLSX.writeFile(libro, `Cuentale-reporte-${negocio.replace(/\s+/g, "-")}.xlsx`);
}
