# aplicacion

### app-shell.tsx

`src/app/app-shell.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AppShell()` | componente | Layout autenticado: sidebar oscuro con la marca, navegación por secciones (cada herramienta con su color) y barra superior con organización, idioma y usuario. Las páginas se renderizan en &lt;Outlet />. |

Notas:

- `AppShellInner`: Barra lateral: fija en escritorio, panel deslizante en móvil
- `AppShellInner`: Un lavado al 10% dejaba el azul y el verde casi indistinguibles. La franja inferior va a color pleno, que es lo que de verdad identifica la herramienta, y el fondo sube lo justo para acompañarla sin pelearse con el contenido.
- `AppShellInner`: En teléfono no caben las dos cosas: si hay una organización abierta, su nombre tiene prioridad sobre el de la sección.
- `AppShellInner`: Sin rol en el proyecto el servidor responde 403 a todo: en vez de pantallas vacías, se explica qué falta.

### error-pages.tsx

`src/app/error-pages.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AppErrorPage({ error, reset, })` | componente | Pantalla de error de la aplicación (errorComponent por defecto del router). |
| `NotFoundPage()` | componente | Página no encontrada |

### providers.tsx

`src/app/providers.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AppProviders({ children })` | componente | Proveedores de datos, idioma, sesión y avisos |
