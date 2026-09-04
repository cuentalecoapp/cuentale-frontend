// Convierte una lista de objetos a un archivo .csv y dispara la descarga en el navegador.
// Se abre directo en Excel al hacer doble clic.
export function exportarCsv(nombreArchivo, filas, columnas) {
  if (!filas.length) return;

  const encabezado = columnas.map((c) => c.etiqueta).join(";");
  const cuerpo = filas
    .map((fila) =>
      columnas
        .map((c) => {
          const valor = c.obtener(fila);
          const texto = String(valor ?? "").replace(/"/g, '""');
          return texto.includes(";") || texto.includes('"') ? `"${texto}"` : texto;
        })
        .join(";")
    )
    .join("\n");

  const contenido = "\uFEFF" + encabezado + "\n" + cuerpo; // \uFEFF: para que Excel muestre tildes bien
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
