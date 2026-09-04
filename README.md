# MVP — Frontend (la pantalla visual)

La aplicación que ve y usa el dueño del negocio: iniciar sesión, crear su negocio,
y registrar/ver sus ingresos y gastos. Se conecta al backend que ya tienes corriendo.

## Requisitos

- Node.js 18+ (el mismo que ya instalaste para el backend)
- El backend corriendo en otra terminal (`npm run dev` dentro de la carpeta `mvp-backend`)

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Se abre en `http://localhost:5173`. Déjalo corriendo en su propia terminal —
necesitas el backend (puerto 3000) y el frontend (puerto 5173) **corriendo al mismo tiempo**,
cada uno en su propia terminal de VS Code.

## Qué incluye

- **Inicio de sesión / registro** de usuario
- **Creación del negocio** (con su color de marca, como vimos en el boceto)
- **Dashboard**: saldo del mes, entradas/salidas, gastos por categoría, movimientos recientes
- **Registrar ingreso o gasto** con validación de datos

## Siguiente paso sugerido

Publicar ambos (backend y frontend) en internet, para que se pueda acceder desde
cualquier ciudad y no solo desde esta computadora.
