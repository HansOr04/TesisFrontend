# Cómo expandir la web

Al terminar, siempre:

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run comentarios
```

## Agregar una página

1. Página en `modules/<módulo>/presentation/pages`.
2. Ruta en `src/routes`, con la dirección como texto literal (el enrutador no admite
   constantes ahí):

   ```tsx
   export const Route = createFileRoute("/_loggedin/assessments/mi-pagina")({
     component: MiPagina,
   });
   ```

3. Su clave en `shared/config/route-keys.ts`.
4. Enlace en `app/app-shell.tsx` y textos en los dos idiomas.
5. Si es de administración, envuélvela con `RequireRole`.

## Agregar una llamada a la API

1. Función en `modules/<módulo>/infrastructure`, con las de `http-client.ts`.
2. Consulta en `application`, con su clave y `enabled`.
3. Tras un cambio, invalida las claves afectadas.

## Agregar una herramienta por KPI

Primero el servidor
([guía](https://github.com/HansOr04/TesisProyectoBack/blob/main/docs/como-expandir.md)).
Después:

1. Copia `modules/organizational-tool` y ajusta API, consultas, definición y páginas:

   ```ts
   export const SUSTAINABILITY_TOOL_UI: IndicatorToolUi = {
     slug: "sustainability",
     i18n: "app.assessment.sustainability",
     api: sustainabilityApi,
     queries: sustainabilityQueries,
     sectionCount: 5,
     routes: { … },
     routeKeys: { … },
   };
   ```

2. Agrega sus valores a los tipos de `indicator-tool/domain/indicator-tool-ui.ts`.
3. Rutas en `src/routes/_loggedin/assessments/sustainability` y sus claves.
4. Color `--tool-sustainability` en `index.css` y `tailwind.config.js`.
5. Menú en `app-shell.tsx`.
6. Donde se listan las tres: `assessment-api.ts`, `consolidated-table.tsx`,
   `applicability-editor.tsx`, `dashboard.page.tsx`, `associations-profileId.page.tsx`,
   `home.page.tsx`, `profile-action-plan.page.tsx`, `analytics-api.ts`,
   `analytics-ui.tsx` y `simulator-tab.tsx`.
7. Textos `app.assessment.sustainability.*` en los dos idiomas.

## Agregar un idioma

1. `shared/i18n/<idioma>.json` con todas las claves.
2. Regístralo en `i18n.tsx`: importación, tipo `Locale` y lista.
3. Opción en el selector de `app-shell.tsx`.

Los textos que escribe el servidor (reportes, errores y ayudas) están en español.

## Agregar una pestaña de analítica

Componente en `analytics/presentation/components` con el formato de
`analytics-layout.tsx` (pregunta, método y hallazgos), su llamada en `analytics-api.ts`,
su consulta y su entrada en `analytics.page.tsx`.

## Agregar un componente básico

En `shared/ui`, sobre Radix y con `cn`. Los botones de solo ícono llevan `title`, que
también sirve a los lectores de pantalla.

## Cambiar colores

Marca y herramientas en `index.css`, semáforo en `score-colors.ts`. Los del reporte
están en el servidor.

## Conectar un servicio externo

Agrega su dominio a la CSP de `vercel.json` y comprueba la consola del navegador.

## Trabajar sin conexión en otra pantalla

Captura solo errores de red y usa `enqueueAssessmentSave`. Al montar y al recuperar la
señal, reintenta. Lo que el servidor rechaza no se encola.
