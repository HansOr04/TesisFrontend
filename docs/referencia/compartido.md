# compartido

### auth-base.ts

`src/shared/api/auth-base.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `resolveAuthBase(apiUrl, sameOrigin)` | función | Base de las rutas /auth que usan la cookie de sesión. En Vercel la web las pide a su propio dominio (vercel.json las reenvía a Heroku): así la cookie es propia y los navegadores que bloquean las de terceros (Safari, Firefox estricto, Brave) no cierran la sesión (HU-71). El resto de la API sigue yendo directo al servidor. |
| `authBase` | constante | Base efectiva de las rutas de sesión |

### http-client.ts

`src/shared/api/http-client.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `configured` (interno) | constante | Cliente HTTP mínimo. Toda la app habla con el backend a través de estas funciones: una sola forma de construir URLs, cabeceras y errores. El token de acceso vive en memoria (session-token.ts) y se renueva solo ante un 401. |
| `baseURL` | constante | Base de la API |
| `endpoint(organisation)` | función | Base con el proyecto |
| `getHeaders(token?)` | función | Cabeceras de autorización |
| `genericGet(organisation, path, token?)` | función | GET /:org/&lt;path> |
| `genericSingleFetch(organisation, controller, id, token?)` | función | GET /:org/&lt;controller>/&lt;id> |
| `genericSingleFetchWithoutOrganisation(controller, id, token?)` | función | GET &lt;controller>/&lt;id> sin prefijo de organización (rutas globales). |
| `genericMutateWithoutOrganisation(controller, methodType, data?, token?)` | función | POST/PUT/PATCH/DELETE sin prefijo de organización (rutas globales). |
| `genericPostPutPatch(organisation, controller, methodType, data, token?)` | función | POST/PUT/PATCH/DELETE /:org/&lt;controller> con cuerpo JSON. |
| `downloadBlobResponse(response, filename)` | función | Descarga un blob de respuesta como archivo en el navegador. |
| `genericFetchForBlob(organisation, controller, methodType, data?, token?)` | función | Descargas (Excel/PPTX): devuelve la Response para leer el blob. |

### session-token.ts

`src/shared/api/session-token.ts`

Token de acceso en memoria (nunca en localStorage): la sesión persiste con el refresh token que el backend guarda en una cookie HttpOnly y rota en cada renovación. Este módulo es la única fuente del token para la capa HTTP.

| Elemento | Tipo | Qué es |
|---|---|---|
| `oneTabAtATime(task)` (interno) | función | Las pestañas comparten la cookie, así que se turnan para renovar: la segunda espera y manda ya la cookie nueva. Si el navegador no tiene Web Locks, el servidor admite renovaciones simultáneas durante unos segundos. |
| `sessionToken` | constante | Token en memoria, con suscripción |
| `refreshAccessToken()` | función | Pide un token de acceso nuevo con la cookie de refresh. Varias llamadas concurrentes (p. ej. 3 peticiones que reciben 401 a la vez) comparten la misma renovación. Devuelve null si no hay sesión. |
| `authorizedFetch(url, init, explicitToken?)` | función | fetch con Authorization y un reintento transparente tras renovar el token cuando el backend responde 401 (token de acceso vencido). |

Notas:

- `refreshAccessToken`: Una petición colgada no deja esperando a las demás pestañas.

### bar-line-chart.tsx

`src/shared/components/bar-line-chart.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `BarLineChart({ chartData, barColor, lineColor = "#174)` | componente | Evolución en el tiempo en barras (una por corte, con el color de su nivel) y una línea encima que une los resultados para ver la tendencia. |

Campos:

- `BarLineChartProps.barColor`: Color de cada barra según su valor (por ejemplo, el del semáforo).

### page-header-context.tsx

`src/shared/components/page-header-context.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `PageHeaderProvider({ children })` | componente | Guarda el nombre destacado |
| `usePageHeaderName()` | función | Lee el nombre destacado actual (lo usa el AppShell para mostrarlo en el navbar). |
| `useSetPageHeaderName(name)` | función | Las páginas de una organización/evaluación puntual llaman esto para destacar su nombre en el navbar mientras están montadas. |

### page-title.tsx

`src/shared/components/page-title.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `PageTitle({ rawTitle, title })` | componente | Título y descripción de página |

### require-role.tsx

`src/shared/components/require-role.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `NoAccess({ message })` (interno) | componente | Pantallas de administración: el menú ya las esconde según el rol, pero alguien puede llegar por la dirección. El servidor rechaza sus acciones; aquí se evita mostrar formularios que no se pueden usar. |
| `RequireAdmin({ children })` | componente | Administrador del proyecto (o superadministrador de la plataforma). |
| `RequireSuperAdmin({ children })` | componente | Superadministrador de la plataforma. |

### route-keys.ts

`src/shared/config/route-keys.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `routeKeys` | enumeración | Rutas del router (deben coincidir con los archivos de src/routes). |

Notas:

- Núcleo: perfiles, panel consolidado, administración
- Herramienta Organizativa
- Herramienta de Capacidades
- Herramienta de Riesgos

### score-colors.ts

`src/shared/design/score-colors.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SCORE_COLORS` | constante | Colores semánticos de puntaje, en hex para usarlos en SVG/canvas y estilos inline (los tokens HSL de index.css tienen el mismo tono). |
| `scoreColor(value)` | función | Color según el puntaje |

Notas:

- 0–5
- 5–7
- 7–10

### i18n.tsx

`src/shared/i18n/i18n.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `Locale` | tipo |  |
| `TranslateParams` | tipo |  |
| `Translate` | tipo | Traduce una clave; `{ {nombre}}` se sustituye con `params`. |
| `TranslateRich` | tipo | Igual que `t` pero devuelve nodos React: `**texto**` se convierte en &lt;b>texto&lt;/b>, para prosa con énfasis (explicaciones de la analítica). |
| `richText(text)` | función | Convierte `**negrita**` en &lt;b> manteniendo el resto como texto. |
| `I18nProvider({ children })` | componente | Idioma de la aplicación |
| `useTranslation()` | función | Funciones de traducción |

Notas:

- `readStoredLocale`: sin localStorage (SSR/tests)
- `I18nProvider`: Misma semántica que el origen: si falta la clave, se muestra el último segmento (p.ej. "app.x.saveButton" → "saveButton") en vez de romper la UI.

### date-only.ts

`src/shared/lib/date-only.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `DATE_ONLY` (interno) | constante | Fechas de calendario (inicio y fin de una medida, semana de inicio de una mitigación): el servidor las guarda como medianoche UTC («2026-11-10T00:00:00.000Z»). Leídas con `new Date()`, en Ecuador (UTC−5) esa medianoche cae a las 19:00 del día anterior y la pantalla mostraba un día menos. Aquí se toman solo el año, el mes y el día, en la hora local. |
| `parseDateOnly(value)` | función | Fecha de calendario sin zona horaria |
| `formatDateOnly(value, locale?, options?)` | función | Fecha de calendario lista para mostrar; «—» si no es válida. |
| `toInputDate(date)` | función | Día local en el formato de `&lt;input type="date">` (AAAA-MM-DD). |

### draft-storage.ts

`src/shared/lib/draft-storage.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `PREFIX` (interno) | constante | Borradores persistidos en localStorage: si la sesión se cierra por accidente (token vencido, pestaña cerrada, refresh) mientras se llena el wizard de una organización o se puntúa una evaluación, los datos no capturados por el servidor todavía se recuperan al volver a entrar. `localStorage` puede no estar disponible (modo privado, cuota llena) — nunca debe romper la app. |
| `loadDraft(key)` | función | Lee un borrador |
| `saveDraft(key, value)` | función | Lo guarda |
| `clearDraft(key)` | función | Lo borra |

Notas:

- `saveDraft`: localStorage lleno o inaccesible: el borrador simplemente no persiste.

### http-response-error.ts

`src/shared/lib/http-response-error.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `HttpResponseError` | clase | Lanzado por el cliente HTTP cuando el servidor responde con estado no-OK, para que la UI pueda decidir por estado (p.ej. 403) sin parsear mensajes. |
| `isHttpResponseError(value)` | función | Si el error es de respuesta HTTP |

### utils.ts

`src/shared/lib/utils.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `cn(inputs)` | función | Une clases CSS |
| `formatDecimal(value, decimals)` | función | Número con decimales |

### web-url.ts

`src/shared/lib/web-url.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `webUrl(text)` | función | Dirección web válida (http o https), normalizada; null si no lo es. |

### tool-queries.ts

`src/shared/query/tool-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ToolReadApi` | tipo | Fábrica de queries de React Query para una herramienta de evaluación. Las tres herramientas exponen la misma API de lectura, así que las claves y las opciones (staleTime, enabled) se definen una sola vez. Las mutaciones de cada página invalidan por clave: `invalidateEvaluation(queryClient, org, id)`. |
| `createToolQueries(tool, api)` | función | Crea las consultas de una herramienta |

Notas:

- datos que cambian al evaluar
- plantillas
- `invalidateEvaluation`: Tras puntuar, completar o planificar: refresca todo lo de la evaluación.
- `invalidateAll`: Tras crear una evaluación o editar la estructura.
