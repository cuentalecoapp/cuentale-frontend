// Guarda movimientos en el propio navegador (IndexedDB) cuando no hay internet,
// para mandarlos al servidor apenas vuelva la conexión. Así el usuario nunca
// pierde lo que registró, aunque esté sin señal en el momento.

const NOMBRE_BASE = "mvp-offline";
const NOMBRE_ALMACEN = "cola_pendiente";

function abrirBase() {
  return new Promise((resolve, reject) => {
    const solicitud = indexedDB.open(NOMBRE_BASE, 1);
    solicitud.onupgradeneeded = () => {
      const db = solicitud.result;
      if (!db.objectStoreNames.contains(NOMBRE_ALMACEN)) {
        db.createObjectStore(NOMBRE_ALMACEN, { keyPath: "id", autoIncrement: true });
      }
    };
    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () => reject(solicitud.error);
  });
}

export async function guardarPendiente(item) {
  const db = await abrirBase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOMBRE_ALMACEN, "readwrite");
    tx.objectStore(NOMBRE_ALMACEN).add({ ...item, creadoEn: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listarPendientes() {
  const db = await abrirBase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOMBRE_ALMACEN, "readonly");
    const solicitud = tx.objectStore(NOMBRE_ALMACEN).getAll();
    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () => reject(solicitud.error);
  });
}

export async function eliminarPendiente(id) {
  const db = await abrirBase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOMBRE_ALMACEN, "readwrite");
    tx.objectStore(NOMBRE_ALMACEN).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function contarPendientes() {
  const pendientes = await listarPendientes();
  return pendientes.length;
}
