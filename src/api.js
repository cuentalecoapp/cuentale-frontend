const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

import { guardarPendiente, listarPendientes, eliminarPendiente } from "./offlineDb.js";

function getToken() {
  return localStorage.getItem("token");
}

async function peticion(ruta, opciones = {}) {
  const token = getToken();

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.error || "Algo salió mal. Intenta de nuevo.");
  }
  return datos;
}

export const api = {
  registro: (nombre, correo, password) =>
    peticion("/auth/registro", { method: "POST", body: JSON.stringify({ nombre, correo, password }) }),

  login: (correo, password) =>
    peticion("/auth/login", { method: "POST", body: JSON.stringify({ correo, password }) }),

  listarNegocios: () => peticion("/negocios"),

  perfilNegocio: (negocioId) => peticion(`/negocios/${negocioId}/perfil`),

  actualizarPerfil: (negocioId, datos) =>
    peticion(`/negocios/${negocioId}/perfil`, { method: "PUT", body: JSON.stringify(datos) }),

  crearNegocio: (nombre, color_marca) =>
    peticion("/negocios", { method: "POST", body: JSON.stringify({ nombre, color_marca }) }),

  resumen: (negocioId) => peticion(`/negocios/${negocioId}/resumen`),

  transacciones: (negocioId) => peticion(`/negocios/${negocioId}/transacciones`),

  crearTransaccion: async (negocioId, datos) => {
    // Sin internet: no se pierde el movimiento, se guarda en el propio navegador
    // para mandarlo en cuanto vuelva la conexión.
    if (!navigator.onLine) {
      await guardarPendiente({ negocioId, datos });
      return { pendienteSincronizar: true, ...datos };
    }

    try {
      return await peticion(`/negocios/${negocioId}/transacciones`, { method: "POST", body: JSON.stringify(datos) });
    } catch (err) {
      // A veces navigator.onLine dice "conectado" pero la petición igual falla
      // (ej. wifi conectado sin salida real a internet). Se guarda igual, por seguridad.
      if (err instanceof TypeError) {
        await guardarPendiente({ negocioId, datos });
        return { pendienteSincronizar: true, ...datos };
      }
      throw err;
    }
  },

  // Intenta mandar todo lo que quedó pendiente por falta de conexión.
  // Devuelve cuántos se sincronizaron con éxito.
  sincronizarPendientes: async () => {
    const pendientes = await listarPendientes();
    let sincronizados = 0;
    for (const item of pendientes) {
      try {
        await peticion(`/negocios/${item.negocioId}/transacciones`, {
          method: "POST",
          body: JSON.stringify(item.datos),
        });
        await eliminarPendiente(item.id);
        sincronizados++;
      } catch {
        // Si uno falla (ej. se cortó la conexión de nuevo a mitad de camino),
        // se deja en la cola y se reintenta la próxima vez.
        break;
      }
    }
    return sincronizados;
  },

  contarPendientesSincronizar: () => listarPendientes().then((p) => p.length),

  eliminarTransaccion: (negocioId, id) =>
    peticion(`/negocios/${negocioId}/transacciones/${id}`, { method: "DELETE" }),

  eliminarFactura: (negocioId, id) =>
    peticion(`/negocios/${negocioId}/facturas/${id}`, { method: "DELETE" }),

  eliminarCuentaPorPagar: (negocioId, id) =>
    peticion(`/negocios/${negocioId}/cuentas-por-pagar/${id}`, { method: "DELETE" }),

  listarFacturas: (negocioId) => peticion(`/negocios/${negocioId}/facturas`),

  verFactura: (negocioId, facturaId) => peticion(`/negocios/${negocioId}/facturas/${facturaId}`),

  crearFactura: (negocioId, datos) =>
    peticion(`/negocios/${negocioId}/facturas`, { method: "POST", body: JSON.stringify(datos) }),

  marcarFacturaPagada: (negocioId, facturaId) =>
    peticion(`/negocios/${negocioId}/facturas/${facturaId}/pagar`, { method: "PATCH" }),

  reporteMensual: (negocioId) => peticion(`/negocios/${negocioId}/reportes/mensual`),

  listarClientes: (negocioId) => peticion(`/negocios/${negocioId}/clientes`),

  listarMiembros: (negocioId) => peticion(`/negocios/${negocioId}/miembros`),

  invitarMiembro: (negocioId, correo) =>
    peticion(`/negocios/${negocioId}/miembros`, { method: "POST", body: JSON.stringify({ correo }) }),

  recomendaciones: (negocioId) => peticion(`/negocios/${negocioId}/recomendaciones`),

  reporteContable: (negocioId) => peticion(`/negocios/${negocioId}/reporte-contable`),

  flujoCaja: (negocioId, hasta) =>
    peticion(`/negocios/${negocioId}/flujo-caja${hasta ? `?hasta=${hasta}` : ""}`),

  listarNumerosWhatsapp: (negocioId) => peticion(`/negocios/${negocioId}/whatsapp`),

  vincularWhatsapp: (negocioId, numero) =>
    peticion(`/negocios/${negocioId}/whatsapp`, { method: "POST", body: JSON.stringify({ numero }) }),

  desvincularWhatsapp: (negocioId, id) =>
    peticion(`/negocios/${negocioId}/whatsapp/${id}`, { method: "DELETE" }),

  listarProductos: (negocioId) => peticion(`/negocios/${negocioId}/productos`),

  crearProducto: (negocioId, datos) =>
    peticion(`/negocios/${negocioId}/productos`, { method: "POST", body: JSON.stringify(datos) }),

  ajustarStock: (negocioId, productoId, cantidad) =>
    peticion(`/negocios/${negocioId}/productos/${productoId}/ajustar-stock`, {
      method: "PATCH",
      body: JSON.stringify({ cantidad }),
    }),

  eliminarProducto: (negocioId, productoId) =>
    peticion(`/negocios/${negocioId}/productos/${productoId}`, { method: "DELETE" }),

  listarCuentasPorPagar: (negocioId) => peticion(`/negocios/${negocioId}/cuentas-por-pagar`),

  crearCuentaPorPagar: (negocioId, datos) =>
    peticion(`/negocios/${negocioId}/cuentas-por-pagar`, { method: "POST", body: JSON.stringify(datos) }),

  marcarCuentaPagada: (negocioId, cuentaId) =>
    peticion(`/negocios/${negocioId}/cuentas-por-pagar/${cuentaId}/pagar`, { method: "PATCH" }),

  alertas: (negocioId) => peticion(`/negocios/${negocioId}/alertas`),

  guardarSesion: (token) => localStorage.setItem("token", token),
  cerrarSesion: () => localStorage.removeItem("token"),
  haySesion: () => Boolean(getToken()),
};
