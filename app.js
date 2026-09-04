// ============================================================
// Configuración
// ============================================================
// Si algún día publicas el backend en internet (Railway, Render, etc.),
// solo tienes que cambiar esta línea por la dirección real.
const API_BASE = "http://localhost:3001/api";

// Formateador de pesos colombianos, reutilizado en toda la app.
const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// Íconos simples según palabras clave en el nombre de la categoría.
const ICONOS_POR_CATEGORIA = {
  venta: "🛍️", ingreso: "💰", insumo: "🧺", arriendo: "🏠",
  servicio: "💡", otro: "📎",
};
function iconoParaCategoria(nombre = "") {
  const clave = Object.keys(ICONOS_POR_CATEGORIA).find((k) => nombre.toLowerCase().includes(k));
  return ICONOS_POR_CATEGORIA[clave] || "💳";
}

// ============================================================
// Estado en memoria de la sesión actual
// ============================================================
const estado = {
  token: localStorage.getItem("token") || null,
  usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
  negocio: JSON.parse(localStorage.getItem("negocio") || "null"),
};

// ============================================================
// Ayudante para llamar a la API sin repetir código en cada sitio
// ============================================================
async function llamarApi(ruta, opciones = {}) {
  const headers = { "Content-Type": "application/json", ...(opciones.headers || {}) };
  if (estado.token) headers.Authorization = `Bearer ${estado.token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });
  } catch (err) {
    // El servidor no responde: probablemente no está encendido.
    throw new Error("No se pudo conectar con el servidor. ¿Está corriendo 'npm run dev'?");
  }

  const datos = respuesta.status === 204 ? null : await respuesta.json();
  if (!respuesta.ok) throw new Error(datos?.error || "Ocurrió un error inesperado.");
  return datos;
}

// ============================================================
// Referencias a elementos del DOM
// ============================================================
const el = (id) => document.getElementById(id);

const vistaAuth = el("vista-auth");
const vistaCrearNegocio = el("vista-crear-negocio");
const vistaDashboard = el("vista-dashboard");

// ============================================================
// Navegación entre pantallas
// ============================================================
function mostrarVista(vista) {
  [vistaAuth, vistaCrearNegocio, vistaDashboard].forEach((v) => (v.hidden = true));
  vista.hidden = false;
}

async function decidirVistaInicial() {
  if (!estado.token) return mostrarVista(vistaAuth);

  try {
    const negocios = await llamarApi("/negocios");
    if (negocios.length === 0) {
      mostrarVista(vistaCrearNegocio);
    } else {
      estado.negocio = negocios[0];
      localStorage.setItem("negocio", JSON.stringify(estado.negocio));
      mostrarVista(vistaDashboard);
      cargarDashboard();
    }
  } catch (err) {
    cerrarSesion();
  }
}

// ============================================================
// Pestañas Entrar / Crear cuenta
// ============================================================
el("tab-login").addEventListener("click", () => cambiarPestañaAuth("login"));
el("tab-registro").addEventListener("click", () => cambiarPestañaAuth("registro"));

function cambiarPestañaAuth(cual) {
  const esLogin = cual === "login";
  el("tab-login").classList.toggle("activa", esLogin);
  el("tab-registro").classList.toggle("activa", !esLogin);
  el("form-login").hidden = !esLogin;
  el("form-registro").hidden = esLogin;
  el("auth-error").hidden = true;
}

function mostrarErrorAuth(mensaje) {
  const cajaError = el("auth-error");
  cajaError.textContent = mensaje;
  cajaError.hidden = false;
}

// ============================================================
// Formulario: iniciar sesión
// ============================================================
el("form-login").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const datos = await llamarApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        correo: el("login-correo").value.trim(),
        password: el("login-password").value,
      }),
    });
    guardarSesion(datos);
    decidirVistaInicial();
  } catch (err) {
    mostrarErrorAuth(err.message);
  }
});

// ============================================================
// Formulario: crear cuenta
// ============================================================
el("form-registro").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const datos = await llamarApi("/auth/registro", {
      method: "POST",
      body: JSON.stringify({
        nombre: el("registro-nombre").value.trim(),
        correo: el("registro-correo").value.trim(),
        password: el("registro-password").value,
      }),
    });
    guardarSesion(datos);
    mostrarVista(vistaCrearNegocio);
  } catch (err) {
    mostrarErrorAuth(err.message);
  }
});

function guardarSesion({ token, usuario }) {
  estado.token = token;
  estado.usuario = usuario;
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function cerrarSesion() {
  estado.token = null;
  estado.usuario = null;
  estado.negocio = null;
  localStorage.clear();
  mostrarVista(vistaAuth);
}
el("btn-salir").addEventListener("click", cerrarSesion);

// ============================================================
// Formulario: crear negocio
// ============================================================
el("form-negocio").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const cajaError = el("negocio-error");
  cajaError.hidden = true;

  try {
    const negocio = await llamarApi("/negocios", {
      method: "POST",
      body: JSON.stringify({
        nombre: el("negocio-nombre").value.trim(),
        color_marca: el("negocio-color").value,
      }),
    });
    estado.negocio = negocio;
    localStorage.setItem("negocio", JSON.stringify(negocio));
    mostrarVista(vistaDashboard);
    cargarDashboard();
  } catch (err) {
    cajaError.textContent = err.message;
    cajaError.hidden = false;
  }
});

// ============================================================
// Panel principal (dashboard)
// ============================================================
async function cargarDashboard() {
  pintarEncabezadoNegocio();

  try {
    const [resumen, movimientos] = await Promise.all([
      llamarApi(`/negocios/${estado.negocio.id}/resumen`),
      llamarApi(`/negocios/${estado.negocio.id}/transacciones`),
    ]);
    pintarResumen(resumen);
    pintarMovimientos(movimientos);
  } catch (err) {
    alert(err.message);
  }
}

function pintarEncabezadoNegocio() {
  const hora = new Date().getHours();
  el("texto-saludo").textContent = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  el("texto-nombre-negocio").textContent = estado.negocio.nombre;
  el("avatar-negocio").textContent = estado.negocio.iniciales || "?";
  el("avatar-negocio").style.background = estado.negocio.color_marca || "#7F77DD";
}

function pintarResumen(resumen) {
  el("texto-saldo").textContent = formatoMoneda.format(resumen.saldo);
  el("texto-entradas").textContent = formatoMoneda.format(resumen.entradas);
  el("texto-salidas").textContent = formatoMoneda.format(resumen.salidas);

  const porcentajeAhorro = resumen.entradas > 0
    ? Math.max(0, Math.round((resumen.saldo / resumen.entradas) * 100))
    : 0;
  el("barra-ahorro").style.width = `${Math.min(porcentajeAhorro, 100)}%`;

  const contenedorCategorias = el("lista-categorias");
  const seccionCategorias = el("seccion-categorias");
  contenedorCategorias.innerHTML = "";

  if (resumen.gastosPorCategoria.length === 0) {
    seccionCategorias.hidden = true;
  } else {
    seccionCategorias.hidden = false;
    const totalGastos = resumen.gastosPorCategoria.reduce((suma, c) => suma + Number(c.total), 0);
    resumen.gastosPorCategoria.forEach((cat) => {
      const porcentaje = totalGastos > 0 ? Math.round((Number(cat.total) / totalGastos) * 100) : 0;
      const chip = document.createElement("span");
      chip.className = "chip-categoria";
      chip.textContent = `${cat.categoria} ${porcentaje}%`;
      contenedorCategorias.appendChild(chip);
    });
  }
}

function pintarMovimientos(movimientos) {
  const lista = el("lista-movimientos");
  const vacio = el("sin-movimientos");
  lista.innerHTML = "";

  if (movimientos.length === 0) {
    vacio.hidden = false;
    return;
  }
  vacio.hidden = true;

  movimientos.forEach((mov) => {
    const fila = document.createElement("div");
    fila.className = "fila-movimiento";

    const fecha = new Date(mov.fecha + "T00:00:00").toLocaleDateString("es-CO", {
      day: "numeric", month: "short",
    });
    const signo = mov.tipo === "ingreso" ? "+" : "−";

    fila.innerHTML = `
      <div class="icono-movimiento ${mov.tipo}">${iconoParaCategoria(mov.categoria || "")}</div>
      <div class="detalle-movimiento">
        <p class="desc-movimiento">${escaparHtml(mov.descripcion)}</p>
        <p class="fecha-movimiento">${fecha}${mov.categoria ? " · " + escaparHtml(mov.categoria) : ""}</p>
      </div>
      <span class="monto-movimiento ${mov.tipo}">${signo} ${formatoMoneda.format(mov.monto)}</span>
      <button class="btn-borrar" title="Eliminar" data-id="${mov.id}">✕</button>
    `;
    lista.appendChild(fila);
  });

  lista.querySelectorAll(".btn-borrar").forEach((boton) => {
    boton.addEventListener("click", () => borrarMovimiento(boton.dataset.id));
  });
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

async function borrarMovimiento(id) {
  if (!confirm("¿Eliminar este movimiento?")) return;
  try {
    await llamarApi(`/negocios/${estado.negocio.id}/transacciones/${id}`, { method: "DELETE" });
    cargarDashboard();
  } catch (err) {
    alert(err.message);
  }
}

// ============================================================
// Panel lateral: agregar ingreso / gasto
// ============================================================
const panelMovimiento = el("panel-movimiento");
const fondoPanel = el("fondo-panel");

el("btn-abrir-ingreso").addEventListener("click", () => abrirPanelMovimiento("ingreso"));
el("btn-abrir-gasto").addEventListener("click", () => abrirPanelMovimiento("gasto"));
el("btn-cerrar-panel").addEventListener("click", cerrarPanelMovimiento);
fondoPanel.addEventListener("click", cerrarPanelMovimiento);

async function abrirPanelMovimiento(tipo) {
  el("movimiento-tipo").value = tipo;
  el("titulo-panel-movimiento").textContent = tipo === "ingreso" ? "Nuevo ingreso" : "Nuevo gasto";
  el("form-movimiento").reset();
  el("movimiento-tipo").value = tipo;
  el("movimiento-fecha").value = new Date().toISOString().slice(0, 10);
  el("movimiento-error").hidden = true;

  await cargarCategoriasEnSelector(tipo);

  fondoPanel.hidden = false;
  panelMovimiento.hidden = false;
  panelMovimiento.setAttribute("aria-hidden", "false");
  el("movimiento-monto").focus();
}

function cerrarPanelMovimiento() {
  fondoPanel.hidden = true;
  panelMovimiento.hidden = true;
  panelMovimiento.setAttribute("aria-hidden", "true");
}

async function cargarCategoriasEnSelector(tipo) {
  const selector = el("movimiento-categoria");
  selector.innerHTML = "";
  try {
    const categorias = await llamarApi(`/negocios/${estado.negocio.id}/categorias`);
    categorias
      .filter((c) => c.tipo === tipo)
      .forEach((c) => {
        const opcion = document.createElement("option");
        opcion.value = c.id;
        opcion.textContent = c.nombre;
        selector.appendChild(opcion);
      });
  } catch (err) {
    // Si falla, el usuario igual puede guardar el movimiento sin categoría.
  }
}

el("form-movimiento").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const cajaError = el("movimiento-error");
  cajaError.hidden = true;

  try {
    await llamarApi(`/negocios/${estado.negocio.id}/transacciones`, {
      method: "POST",
      body: JSON.stringify({
        tipo: el("movimiento-tipo").value,
        monto: Number(el("movimiento-monto").value),
        descripcion: el("movimiento-descripcion").value.trim(),
        categoria_id: el("movimiento-categoria").value || null,
        fecha: el("movimiento-fecha").value,
      }),
    });
    cerrarPanelMovimiento();
    cargarDashboard();
  } catch (err) {
    cajaError.textContent = err.message;
    cajaError.hidden = false;
  }
});

// ============================================================
// Arranque
// ============================================================
decidirVistaInicial();
