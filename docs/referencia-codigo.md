# Referencia del código de la web

Todos los archivos de código, con lo que exporta cada uno y por qué está hecho así.
Las pruebas y los componentes visuales básicos (`shared/ui`) no se listan.

## src/app

### `src/app/app-shell.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AppShell()` | componente | Layout autenticado: sidebar oscuro con la marca, navegación por secciones (cada herramienta con su color) y barra superior con organización, idioma y usuario. Las páginas se renderizan en &lt;Outlet />. |

Notas:

- `AppShellInner`: Barra lateral: fija en escritorio, panel deslizante en móvil
- `AppShellInner`: Un lavado al 10% dejaba el azul y el verde casi indistinguibles. La franja inferior va a color pleno, que es lo que de verdad identifica la herramienta, y el fondo sube lo justo para acompañarla sin pelearse con el contenido.
- `AppShellInner`: En teléfono no caben las dos cosas: si hay una organización abierta, su nombre tiene prioridad sobre el de la sección.
- `AppShellInner`: Sin rol en el proyecto el servidor responde 403 a todo: en vez de pantallas vacías, se explica qué falta.

### `src/app/error-pages.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AppErrorPage({ error, reset, })` | componente | Pantalla de error de la aplicación (errorComponent por defecto del router). |
| `NotFoundPage()` | componente | Página no encontrada |

### `src/app/providers.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AppProviders({ children })` | componente | Proveedores de datos, idioma, sesión y avisos |


## src

### `src/main.tsx`


## src/modules/analytics

### `src/modules/analytics/application/analytics-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `STALE` (interno) | constante | La analítica es cara de calcular y cambia solo al completar evaluaciones: se cachea 5 minutos por pestaña/parámetros. |
| `analyticsQueries` | constante | Consultas de analítica |

### `src/modules/analytics/domain/simulator.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SimIndicator` | tipo | Simulador "¿qué pasaría si…?": recalcula el puntaje por sección y global de una evaluación al fijar puntajes objetivo en algunos KPI, con la misma media ponderada que usa el backend (peso de KPI dentro de la sección, peso de sección en el global). Puro: sin React ni red, testeable. |
| `SimSection` | tipo |  |
| `SimResult` | tipo |  |
| `simulate(sections, targets)` | función | Recalcula puntajes con notas objetivo |
| `marginalGain(sections, indicatorId)` | función | Ganancia en el puntaje global por cada punto que suba el KPI (sensibilidad). |

### `src/modules/analytics/infrastructure/analytics-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AnalyticsTool` | tipo |  |
| `CorrelationStrength` | tipo |  |
| `SegmentKey` | tipo |  |
| `HistogramBin` | tipo |  |
| `OverviewSection` | tipo |  |
| `OverviewTool` | tipo |  |
| `AnalyticsOverview` | tipo |  |
| `SystemicGap` | tipo |  |
| `GapsResponse` | tipo |  |
| `DriverSection` | tipo |  |
| `CrossToolEntry` | tipo |  |
| `FactorEntry` | tipo |  |
| `CorrelationsResponse` | tipo |  |
| `SegmentRow` | tipo |  |
| `SegmentsResponse` | tipo |  |
| `EffectGroup` | tipo |  |
| `EffectivenessTool` | tipo |  |
| `EffectivenessResponse` | tipo |  |
| `ClusterLevel` | tipo |  |
| `ClusterEntry` | tipo |  |
| `ClustersResponse` | tipo |  |
| `BenchmarkResponse` | tipo |  |
| `fetchAnalyticsOverview(org, token?)` | función | Panorama |
| `fetchAnalyticsGaps(org, tool, token?)` | función | Brechas |
| `fetchAnalyticsCorrelations(org, token?)` | función | Correlaciones |
| `fetchAnalyticsSegments(org, by, token?)` | función | Segmentos |
| `fetchAnalyticsEffectiveness(org, token?)` | función | Efectividad |
| `fetchAnalyticsClusters(org, tool, k, token?)` | función | Tipologías |
| `fetchAnalyticsBenchmark(org, profileId, token?)` | función | Posición relativa |

Campos:

- `ClusterEntry.level`: Código estable de la tipología; `label` es su texto en español.

### `src/modules/analytics/presentation/components/analytics-layout.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `TabHeader({ title, question, children, })` | componente | Cabecera de una pestaña: título grande y la pregunta que responde. |
| `MethodCard({ compute, read, lookFor, })` | componente | Bloque metodológico en tres columnas: cómo se calcula, cómo se lee, qué buscar. |
| `KeyFindings({ items })` | componente | Hallazgos clave numerados, en texto grande. |
| `ChartCard({ title, description, howToRead, childre)` | componente | Tarjeta de gráfico a ancho completo con guía de lectura al lado. |
| `Note({ children })` | componente | Glosario / nota de interpretación compacta. |

### `src/modules/analytics/presentation/components/analytics-ui.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `useAnalyticsLabels()` | función | Etiquetas traducidas de herramientas y fuerzas de correlación. Las páginas de analítica las obtienen con `useAnalyticsLabels()`. |
| `TOOL_SHORT` | constante | Nombres cortos |
| `TOOL_COLOR` | constante | Color por herramienta |
| `TOOLS` | constante | Herramientas |
| `heatColor(value)` | función | Color de celda para mapas de calor 0–10 (rojo → ámbar → verde). |
| `heatAlpha(value)` | función | Intensidad del mapa de calor |
| `corrColor(r)` | función | Color para correlaciones −1..1 (azul negativo, verde positivo). |
| `StatTile({ label, value, hint, tone = "brand", })` | componente | Cifra destacada |
| `Insight({ children, tone = "brand", })` | componente | Hallazgo en lenguaje natural derivado de los datos (para la memoria). |
| `SectionTitle({ title, subtitle, right, })` | componente | Título de bloque |
| `ToolTabs({ value, onChange, })` | componente | Selector de herramienta |
| `fmt(v, d)` | función | Número con decimales |
| `pct(v)` | función | Porcentaje |

### `src/modules/analytics/presentation/components/clusters-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ClustersTab({ tool, k, onToolChange, onKChange, data)` | componente | Pestaña de tipologías |

### `src/modules/analytics/presentation/components/correlations-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CorrelationsTab({ data })` | componente | Pestaña de correlaciones |

### `src/modules/analytics/presentation/components/effectiveness-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `EffectivenessTab({ data })` | componente | Pestaña de efectividad |

### `src/modules/analytics/presentation/components/gaps-ranking.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GapsRanking({ data, tool, })` | componente | Ranking visual de brechas sistémicas: cada KPI es una fila-tarjeta con barras (frecuencia crítica, prioridad), anillo de promedio, cobertura de medidas y un detalle expandible con las organizaciones afectadas. |

### `src/modules/analytics/presentation/components/gaps-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GapsTab({ tool, onToolChange, data, loading })` | componente | Pestaña de brechas |

### `src/modules/analytics/presentation/components/overview-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OverviewTab({ data })` | componente | Pestaña de panorama |

### `src/modules/analytics/presentation/components/segments-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SegmentsTab({ by, onChange, data, loading, })` | componente | Pestaña de segmentos |

### `src/modules/analytics/presentation/components/simulator-tab.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SimulatorTab({ tool, onToolChange, })` | componente | Pestaña del simulador |

Notas:

- `SimulatorTab`: Una por organización (la más reciente con respuestas).

### `src/modules/analytics/presentation/pages/analytics.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AnalyticsPage()` | componente | Analítica de datos transversal: cada pestaña consume un endpoint del módulo assessment-analytics del backend y genera hallazgos en texto a partir de los números (los mismos que se citan en la memoria). |

Notas:

- `AnalyticsPage`: Cada pestaña consulta solo cuando está activa; React Query cachea los resultados por parámetros, así cambiar de pestaña y volver es inmediato.


## src/modules/assessment-core

### `src/modules/assessment-core/application/core-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `coreKeys` | constante | Queries del núcleo (perfiles y panel consolidado). |
| `coreQueries` | constante | Consultas de organizaciones y panel |

### `src/modules/assessment-core/domain/kpi-scope.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `countsInEvaluation(indicator)` | función | Un KPI entra en la evaluación cuando se cumplen las dos condiciones, que son independientes entre sí: - `active`: sigue vigente en la plantilla de la organización. Desactivarlo desde Administración lo apaga para todo el mundo, sin borrarlo. - `applicable`: aplica a esta organización evaluada en concreto, según lo que se marcó en «KPI aplicables». El backend ya las usa juntas para puntuar y para exigir completitud; el formulario tiene que mirar las mismas dos, o acabaría pidiendo calificar un KPI que después no cuenta para nada. |

### `src/modules/assessment-core/domain/section-average.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `weightedSectionAverage(indicators, scores)` | función | Promedio de una sección ponderado por el peso de cada KPI, el mismo que calcula el servidor para el resumen y el historial. Solo cuentan los KPI ya calificados; sin ninguno, el promedio es 0. El peso llega del servidor como texto («7»), porque Prisma serializa los Decimal así aunque el tipo diga number. Sin el Number() la suma de pesos concatena («0777…») y el promedio queda en 0.0 con la sección calificada. |

### `src/modules/assessment-core/infrastructure/assessment-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentProfileType` | tipo |  |
| `AssessmentAssociationLevel` | tipo |  |
| `AssessmentOrganisationProfile` | tipo |  |
| `CreateAssessmentProfileInput` | tipo |  |
| `UpdateAssessmentProfileInput` | tipo |  |
| `AssessmentIndicatorData` | tipo |  |
| `AssessmentSectionData` | tipo |  |
| `CreateAssessmentSectionInput` | tipo |  |
| `UpdateAssessmentSectionInput` | tipo |  |
| `CreateAssessmentIndicatorInput` | tipo |  |
| `UpdateAssessmentIndicatorInput` | tipo |  |
| `AssessmentProfileApplicability` | tipo |  |
| `fetchProfileApplicability(org, profileId, token?)` | función | Lee los KPI aplicables |
| `setProfileApplicability(org, profileId, data, token?)` | función | Los guarda |
| `AssessmentTemplateData` | tipo |  |
| `AssessmentResponseData` | tipo |  |
| `AssessmentSectionScore` | tipo |  |
| `AssessmentEvaluationHistoryEntry` | tipo |  |
| `AssessmentEvaluationStatus` | tipo |  |
| `AssessmentEvaluationData` | tipo |  |
| `AssessmentEvaluationListItem` | tipo |  |
| `AssessmentCriticalIndicator` | tipo |  |
| `AssessmentEvaluationSummary` | tipo |  |
| `AssessmentKpiResponseInput` | tipo |  |
| `fetchAssessmentProfiles(org, token?)` | función | Perfiles de organización (RF-02, assessment-core) |
| `AssessmentAdminProfileRow` | tipo |  |
| `fetchAllAssessmentProfilesForAdmin(token?)` | función | RF-08: vista cross-organización, solo para el Administrador de plataforma (isSuperAdmin). No está scoped a una organización, por eso usa el fetch sin prefijo de org (igual que /organisations/user-organisations). |
| `createAssessmentProfile(org, data, token?)` | función | Registra una organización |
| `fetchAssessmentProfile(org, id, token?)` | función | Detalle |
| `ProfileActionPlanMeasure` | tipo | Una medida del plan consolidado de una organización (las tres herramientas). |
| `ProfileActionPlan` | tipo |  |
| `fetchProfileActionPlan(org, profileId, token?)` | función | Plan consolidado |
| `updateAssessmentProfile(org, id, data, token?)` | función | Edita |
| `AssessmentProfileChildToolScore` | tipo |  |
| `AssessmentProfileToolScores` | tipo |  |
| `AssessmentProfileChildRow` | tipo |  |
| `AssessmentAssociationOverview` | tipo |  |
| `fetchAssessmentAssociationOverview(org, id, token?)` | función | Panel de una asociación |
| `AssessmentDashboardTool` | tipo | Panel consolidado multi-herramienta (RF-07) |
| `AssessmentDashboardFilters` | tipo |  |
| `AssessmentDashboardToolSummary` | tipo |  |
| `AssessmentDashboardRow` | tipo |  |
| `fetchAssessmentDashboard(org, filters, token?)` | función | Panel consolidado |
| `exportAssessmentDashboard(org, filters, token?)` | función | Descarga el panel |
| `AssessmentMeasureStatus` | tipo |  |
| `AssessmentInconsistencyFinding` | tipo | IA y exportes comunes a las tres herramientas |
| `NarrativeTone` | tipo |  |
| `AssessmentGanttItem` | tipo | Fila del cronograma (Gantt) de medidas; común a las tres herramientas. |

Campos:

- `AssessmentOrganisationProfile.confidential`: Excluye este perfil de la vista cross-organización del Administrador.
- `AssessmentOrganisationProfile.parentProfileId`: Solo aplica si el padre es type="ASSOCIATION" y associationLevel="LEVEL_2".
- `CreateAssessmentProfileInput.evaluatorId`: `null` limpia explícitamente el evaluador asignado; `undefined` deja el campo sin tocar (ver UpdateAssessmentProfileDto en el server).
- `AssessmentIndicatorData.helpText`: Qué documento/proceso concreto debe existir para este KPI.
- `AssessmentIndicatorData.scoringRubric`: Nota de calificación específica de este KPI, complementa la rúbrica genérica 1-10.
- `AssessmentIndicatorData.applicable`: false cuando el evaluador marcó este KPI como "no aplica" para el perfil evaluado.
- `AssessmentSectionData.applicable`: false cuando el evaluador marcó esta sección como "no aplica" para el perfil evaluado.

### `src/modules/assessment-core/infrastructure/assessment-roles-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentUserRoleAssignment` | tipo | La asignación de roles de evaluación pasa siempre por /:org/assessments/roles: ahí se aplican el permiso de administración, la auditoría y la protección al revocar a quien tiene evaluaciones activas. |
| `assessmentRoleAssignmentsQueryOptions(organisation, token?)` | función | Consulta de asignaciones |
| `fetchAssessmentRoleAssignments(organisation, token?)` | función | Lista |
| `assignAssessmentRole(organisation, userId, roleCode, token?)` | función | Asigna |
| `revokeAssessmentRole(organisation, id, confirm, token?)` | función | Revoca |

### `src/modules/assessment-core/infrastructure/tool-common-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `detectInconsistenciesFor(tool)` | función | Capacidades que las tres herramientas exponen con la misma forma: se construyen por segmento de ruta ("organizational" \| "capacity" \| "risk"). |
| `generateExecutiveNarrativeFor(tool)` | función | Pide la narrativa |
| `exportSummaryFor(tool, path, filePrefix)` | función | Descarga el Excel |
| `ReportGanttScope` | tipo | Alcance del Gantt del reporte; debe coincidir con el DTO del backend. |
| `exportSummaryPptxFor(tool, path, filePrefix)` | función | Descarga la presentación |

### `src/modules/assessment-core/presentation/components/applicability-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ApplicabilityDialog({ profile, open, onOpenChange, onSaved, )` | componente | Editar qué KPI aplican a una organización ya creada. Los KPI marcados como "no aplica" no se exigen al completar la evaluación ni entran en el puntaje. |

### `src/modules/assessment-core/presentation/components/applicability-editor.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ApplicabilityToolKey` | tipo |  |
| `ApplicabilityEditorProps` | tipo |  |
| `ApplicabilityEditor({ excludedSectionIds, excludedIndicatorI)` | componente | Editor de KPI aplicables por organización: carga la plantilla activa de cada herramienta y permite marcar secciones enteras o KPI individuales como "no aplica". Controlado: el padre guarda los sets de exclusión. |

Notas:

- `ApplicabilityEditor`: `t` se usa como variable de iteración en este archivo: la traducción es `tr`.
- `ApplicabilityEditor`: Un KPI desactivado en la plantilla sigue en la lista para poder verlo y decidir, pero se marca porque no cuenta en las evaluaciones nuevas.

### `src/modules/assessment-core/presentation/components/assign-evaluator-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssignEvaluatorDialog({ organisation, profile, open, onOpenCha)` | componente | Asignar evaluador y confidencialidad |

Notas:

- `AssignEvaluatorDialog`: El dato «confidencial» solo lo cambia el superadministrador dueño del proyecto.

### `src/modules/assessment-core/presentation/components/complete-evaluation-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CompleteEvaluationDialog({ open, onOpenChange, onConfirm, answere)` | componente | Doble confirmación antes de completar una evaluación: completarla la cierra (queda en el historial en solo lectura), así que primero se muestra un resumen de lo calificado y después se pide confirmar de forma explícita. |

### `src/modules/assessment-core/presentation/components/consolidated-table.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ConsolidatedTable({ rows, t, onOpenEvaluation, })` | componente | Tabla del panel consolidado |

### `src/modules/assessment-core/presentation/components/critical-kpi-panel.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CriticalKpiPanel({ criticalIndicators, sections, sectionL)` | componente | Panel interactivo de KPI críticos: filtro por sección, búsqueda, orden por severidad, distribución de puntajes y tarjetas expandibles con la observación completa y acciones (ir a la sección, planificar medida). |

Campos:

- `CriticalKpiPanelProps.sectionLabel`: Etiqueta de la sección: "Dimensión" \| "Área" \| "Principio".
- `CriticalKpiPanelProps.onPlanMeasure`: Si se pasa, cada tarjeta ofrece "Planificar medida".
- `CriticalKpiPanelProps.indicatorsWithMeasure`: Ids de indicadores que ya tienen una medida registrada.

### `src/modules/assessment-core/presentation/components/evolution-history.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `MAX_COLUMNS` (interno) | constante | Más allá de seis cortes la tabla no cabe sin scroll horizontal incómodo; se muestran los más recientes, que son los que se comparan. |
| `Delta({ value })` (interno) | componente | Variación entre el último corte y el anterior. Se calcula sobre los valores ya redondeados a un decimal, que son los que se ven en la tabla: si no, una diferencia de 0,01 entre 7,04 y 7,05 se lee como "7.0 → 7.1" con variación "=", que no cuadra. |
| `EvolutionHistory({ history, t, sectionLabel, onRetake, re)` | componente | Historial de la organización en esta herramienta: cómo ha evolucionado el puntaje global y, sobre todo, qué cambió en cada dimensión de un corte al siguiente. Es solo lectura — para comparar, no para editar. Se muestra también cuando todavía no hay ningún corte cerrado: si desapareciera, no habría forma de saber que el historial existe ni desde dónde iniciar el siguiente ciclo. |

Campos:

- `EvolutionHistoryProps.sectionLabel`: "Dimensión", "Área" o "Principio", según la herramienta.
- `EvolutionHistoryProps.onRetake`: Inicia un ciclo nuevo para la misma organización y herramienta.
- `EvolutionHistoryProps.currentEvaluationId`: Evaluación desde la que se abre el historial: su columna no ofrece "Ver".
- `EvolutionHistoryProps.onOpenEvaluation`: Abre una evaluación del historial para ver la nota de cada KPI.

Notas:

- `EvolutionHistory`: El orden del backend no está garantizado y aquí la cronología es el eje de toda la lectura, así que se ordena antes de recortar.
- `EvolutionHistory`: Una fila por dimensión: se toman todas las que aparecen en algún corte, con el nombre del más reciente (las plantillas se pueden renombrar).
- `EvolutionHistory`: La columna del corte más reciente se resalta: es contra la que se compara todo lo demás.
- `EvolutionHistory`: La tabla compara dimensiones; el detalle KPI por KPI de cada corte se consulta abriendo esa evaluación, que se muestra en solo lectura por estar completada.

### `src/modules/assessment-core/presentation/components/executive-summary.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `EvaluatedSection` (interno) | tipo | FE3-B05: resumen ejecutivo — velocímetros de aguja por dimensión, puntaje global, tabla de resumen por dimensión y botón "Completar evaluación" . |
| `ExecutiveSummary({ globalScore, sectionScores, sections, )` | componente | Resumen ejecutivo |

Campos:

- `ExecutiveSummaryProps.labels`: Sobrescribe las etiquetas específicas de Organizational (título, "Dimensión", etc.) para reutilizar este componente en Risk ("Principio") sin duplicarlo.
- `ExecutiveSummaryProps.onPlanMeasure`: Abre el plan de acción/mitigación para planificar una medida de este KPI.
- `ExecutiveSummaryProps.indicatorsWithMeasure`: KPI que ya cuentan con una medida registrada.

Notas:

- `ExecutiveSummary`: Mismo criterio que el formulario: un KPI desactivado o que no aplica a esta organización no se pide, así que tampoco cuenta en el total.
- `ExecutiveSummary`: Velocímetros del mismo tamaño en una cuadrícula pareja: el nombre ocupa siempre dos líneas para que todos queden alineados.

### `src/modules/assessment-core/presentation/components/export-report-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GanttScope` | tipo | Qué abarca el Gantt del reporte. Debe coincidir con el DTO del backend. |
| `ExportReportDialog({ open, onOpenChange, onConfirm, exporti)` | componente | El reporte siempre lleva el mismo contenido; lo único que se elige al generarlo es hasta dónde llega el Gantt del plan de acción, porque a veces interesa el plan de esta evaluación y a veces el de toda la organización o el del proyecto entero. |

### `src/modules/assessment-core/presentation/components/gantt-chart.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RED` (interno) | constante | Cronograma de mitigación/acción (RF-06, luego rediseñado): barra horizontal por medida, posicionada por CSS (offset%/ancho% dentro del rango total de fechas) — sin librería de gráficos, mismo criterio de "SVG/CSS propio" ya usado en gauge.tsx. El color de cada barra refleja el CUMPLIMIENTO DE PLAZO, no el % de avance ni el status crudo: risk = completada, rojo = plazo vencido sin completar (atrasada), ámbar = en curso/pendiente pero todavía dentro de plazo. Mismos hex que gauge.tsx para mantener el mismo lenguaje visual que los badges de puntaje KPI. |
| `GanttChart({ measures, statusLabel, emptyLabel, tod)` | componente | Cronograma |

Notas:

- `startOfWeek`: semana empieza en lunes
- `GanttChart`: En pantallas angostas el cronograma se desplaza dentro de su caja en vez de ensanchar toda la página (HU-58).
- `width`: ancho mínimo visible

### `src/modules/assessment-core/presentation/components/gauge.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RED` (interno) | constante | Velocímetro de aguja por dimensión/global (FE3-B04), replicando el diseño de Figma: semicírculo con 3 zonas fijas (rojo 0–5, amarillo 5–7, risk 7–10) y una aguja que apunta al valor. Sin dependencias nuevas — SVG propio. |
| `GAUGE_YELLOW` | constante | Amarillo propio del velocímetro; el resto de la app usa SCORE_COLORS.medium. |
| `gaugeColor(value)` | función | Umbrales de zona visual (leyenda del mockup: 0-5 Bajo, 5-7 Medio, 7-10 Alto). Coloreado crítico de negocio (RF-03: score &lt;= 5) usa el mismo corte rojo/no-rojo. |
| `Gauge({ value, label, weightLabel, size = "sm")` | componente | Velocímetro |

Campos:

- `GaugeProps.value`: 0-10
- `GaugeProps.weightLabel`: e.g. "PESO 25%"

Notas:

- `Gauge`: Se adapta al ancho de su tarjeta, sin pasar de su tamaño nominal.

### `src/modules/assessment-core/presentation/components/impact-priority-panel.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ImpactPriorityDisplayItem` | tipo |  |
| `ImpactPriorityPanel({ items, t, onPlanMeasure, })` | componente | Ranking de KPI críticos por impacto (peso × brecha bajo el umbral): podio con los 3 primeros, barras relativas al máximo, filtro por sección y lista colapsable para no abrumar cuando hay decenas de KPI. |

Campos:

- `ImpactPriorityPanelProps.onPlanMeasure`: Abre el plan para crear la medida de este KPI.

### `src/modules/assessment-core/presentation/components/kpi-help-rubric-buttons.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `parseRubricCriteria(text)` (interno) | función | Rúbrica analítica: scoringRubric guarda un JSON `{"criteria": ["...", ...]}` con 3-5 criterios verificables específicos del KPI (no una sola descripción holística por puntaje). Se muestran como checklist; el puntaje 1-10 depende de cuántos criterios se cumplen (leyenda genérica, no repetida por KPI). |
| `parseRubricBands(text)` (interno) | función | Formato legado "10 = descripción.\n7-8 = descripción...." — se mantiene como fallback para cualquier KPI que aún no se haya migrado a criterios. |
| `KpiHelpRubricButtons({ helpText, scoringRubric, t, })` | componente | FE3-B03 (rediseño): dos botones ícono junto al nombre del KPI, siempre visibles — Ayuda (qué documento/proceso debe existir) y Rúbrica (cómo interpretar la escala 1-10). Compartido por Organizativa/Capacidades (kpi-score-row.tsx) y Risk (kpi-score-row-risk.tsx) para no duplicar el Dialog. |

Notas:

- `parseRubricCriteria`: No es JSON: puede ser una rúbrica antigua en formato "10 = ...".

### `src/modules/assessment-core/presentation/components/kpi-score-row.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `KpiScoreRowProps` (interno) | tipo | FE3-B03: tarjeta de indicador — colapsada muestra número + nombre + descripción; al expandir muestra 10 botones de calificación (1-10) y la observación obligatoria (UCA-04). Sin botón de guardado individual: el padre agrega los cambios de toda la dimensión y los guarda con un solo botón "Guardar". |
| `KpiScoreRow({ indicatorId, number, name, description)` | componente | Tarjeta de calificación de un KPI |

Campos:

- `KpiScoreRowProps.manualCritical`: El evaluador la marca a mano como "requiere atención", sin importar el score.
- `KpiScoreRowProps.readOnly`: Evaluación completada: se ve la nota y lo registrado, sin poder cambiarlo.

### `src/modules/assessment-core/presentation/components/measure-progress-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `MeasureProblem` | tipo |  |
| `MeasureSolution` | tipo |  |
| `MeasureProgressValues` | tipo |  |
| `MeasureProgressDialog({ open, onOpenChange, problem, solution,)` | componente | Ventana de seguimiento de una medida: recorre el flujo Problema detectado → Solución propuesta → Registrar avance (con resultado esperado y mejoras aplicadas). La usan los planes de acción (Organizativa/Capacidades) y el plan de mitigación (Riesgos). |

Campos:

- `MeasureProblem.score`: Calificación del KPI (1–10).
- `MeasureProblem.riskDescription`: Solo herramienta de riesgos.

Notas:

- `MeasureProgressDialog`: Concluir una medida es afirmar que el riesgo o la brecha se atendió: se exige dejar escrito qué se implementó, que es lo que muestran el tablero y el reporte de una medida concluida.
- `MeasureProgressDialog`: Columna izquierda: problema y solución ──
- `MeasureProgressDialog`: Columna derecha: avance ──

### `src/modules/assessment-core/presentation/components/plan-measure-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `PlanMeasureValues` | tipo |  |
| `AiMeasureSuggestion` | tipo |  |
| `PlanMeasureDialog({ open, onOpenChange, problem, scheduleM)` | componente | Popup "Planificar medida": se abre con el problema ya cargado (KPI, calificación, observación, riesgo) y el formulario listo para describir la solución; opcionalmente pide una propuesta a la IA y la vuelca al formulario. |

Campos:

- `PlanMeasureDialogProps.scheduleMode`: "dates": fecha inicio/fin (planes de acción) · "week": semana + duración (mitigación).
- `PlanMeasureDialogProps.requireName`: Las herramientas de plan de acción piden un nombre corto además de la descripción.
- `PlanMeasureDialogProps.onSuggest`: Pide una sugerencia a la IA para este KPI. Devuelve null si no hay sugerencia.
- `PlanMeasureDialogProps.blockedReason`: Motivo por el que no se puede planificar (p.ej. riesgo despreciable).

Notas:

- `PlanMeasureDialog`: Problema + IA ──
- `PlanMeasureDialog`: Formulario de la medida ──

### `src/modules/assessment-core/presentation/components/ring-gauge.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RingGaugeProps` (interno) | tipo | Anillo de progreso circular (0–10). Con `label` muestra el texto debajo; en tamaños pequeños (tarjetas de KPI) se usa sin etiqueta y con trazo fino. |
| `RingGauge({ value, label, size = 110, strokeWidth )` | componente | Anillo de progreso |

Campos:

- `RingGaugeProps.value`: 0-10
- `RingGaugeProps.integer`: Muestra el valor como entero (p.ej. "4") en vez de "4.0".

### `src/modules/assessment-core/presentation/components/section-panel.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `DraftResponse` | tipo |  |
| `DimensionViewProps` (interno) | tipo | FE3-B03/B04: vista de UNA dimensión a la vez (wizard), replicando el diseño de Figma — nada de acordeón con las 6 dimensiones abiertas a la vez. |
| `DimensionView({ number, name, indicators, responses, t)` | componente | Una sección del asistente |

Campos:

- `DimensionViewProps.readOnly`: Evaluación completada: los KPI se muestran sin poder editarse.
- `DimensionViewProps.labels`: Sobrescribe las etiquetas específicas de Organizational ("Dimensión", "KPI completados") para reutilizar este componente en Capacity ("Área") sin duplicarlo.

### `src/modules/assessment-core/presentation/components/template-admin.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentTemplateAdmin({ toolTitle, sectionLabel, onBack, fetch)` | componente | Consumido por app/src/routes/_loggedin/assessments/{organizational,risk,capacity}/admin.tsx — un único componente de administración de estructura (secciones + KPI) para las 3 herramientas, ya que AssessmentSection/AssessmentIndicator son modelos compartidos y el backend ya expone el CRUD completo (versionado copy-on-write: editar una plantilla ya evaluada crea una nueva versión en vez de mutar la existente). |

Notas:

- `AssessmentTemplateAdmin`: Sección
- `AssessmentTemplateAdmin`: Indicador

### `src/modules/assessment-core/presentation/pages/admin-global.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentAdminGlobalPage()` | componente | RF-08: «Gestionar organizaciones» del Administrador de plataforma — lista las organizaciones Assessment de TODOS los clientes (no solo la organización activa en el selector), excluyendo las marcadas como confidenciales. El backend (RequireGlobalSuperAdmin) es la fuente real de verdad del acceso; esta página solo se enlaza en el menú para superadmins. Editar una organización cambia primero al proyecto al que pertenece, porque el formulario de edición trabaja sobre el proyecto activo. |

### `src/modules/assessment-core/presentation/pages/associations-profileId.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssociationDetailPage()` | componente | Panel de una asociación |

### `src/modules/assessment-core/presentation/pages/dashboard.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentDashboardPage()` | componente | Panel consolidado |

### `src/modules/assessment-core/presentation/pages/home.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentProfilesPage()` | componente | Lista de organizaciones |

Notas:

- `AssessmentProfilesPage`: Elegir el evaluador responsable es del administrador; el servidor rechaza el cambio si lo intenta un evaluador.
- `AssessmentProfilesPage`: Asociaciones Nivel 2 agrupan otras organizaciones (Nivel 1 o empresas) como miembros vía parentProfileId. Se muestran como acordeón para que se vea de un vistazo qué organizaciones pertenecen a cuál asociación.

### `src/modules/assessment-core/presentation/pages/new.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `WizardDraftSnapshot` (interno) | tipo | Si la sesión se cierra por accidente a mitad del wizard (token vencido, pestaña cerrada), este borrador permite recuperar lo ya escrito al volver a entrar — se guarda en localStorage, no en el servidor. Solo aplica al alta (no en edición, que ya carga sus datos desde el servidor). |
| `DEFAULT_PHONE_DIGITS` (interno) | constante | Dígitos del número nacional cuando todavía no se eligió el país. |
| `LatamCountry` (interno) | tipo | Código ISO 3166-1 alpha-2 (mismo formato que usa el resto del sistema, p.ej. AssessmentRiskCountryParam) + prefijo telefónico + dígitos exactos del número nacional (celular, sin el 0 de marcación nacional). Con 9 fijos para todos no se podía registrar un celular de Colombia (10). El servidor valida con la misma tabla (assessment-core/domain/contact-phone). |
| `stripPhonePrefix(phone)` (interno) | función | Quita cualquier prefijo "+&lt;código> " ya presente, dejando solo dígitos. |
| `AssessmentProfileWizardPage({ profileId, })` | componente | El mismo asistente sirve para dar de alta y para corregir después lo que se capturó: con `profileId` arranca en modo edición, precargado. |

Notas:

- `AssessmentProfileWizardPage`: Nivel 2: cuántas organizaciones miembro hay que crear justo después de guardar la asociación (se pide una vez, al momento de elegir Nivel 2).
- `AssessmentProfileWizardPage`: En edición el navbar muestra de qué organización son los datos que se están tocando; en el alta todavía no hay nombre que destacar.
- `AssessmentProfileWizardPage`: Solo en alta: en edición los datos vienen del servidor, no de un borrador local a medio llenar.
- `AssessmentProfileWizardPage`: Restaura el borrador guardado (si existe) una sola vez, apenas se conoce la organización activa.
- `AssessmentProfileWizardPage`: Solo debe ejecutarse una vez, al montar (guardado por restoredRef). eslint-disable-next-line react-hooks/exhaustive-deps
- `AssessmentProfileWizardPage`: Guarda el borrador en cada cambio, para sobrevivir un cierre de sesión accidental.
- `AssessmentProfileWizardPage`: Modo edición: se cargan el perfil y su aplicabilidad antes de mostrar nada, para que el asistente arranque con lo que se guardó en el alta.
- `AssessmentProfileWizardPage`: En edición, `stay` guarda sin salir del formulario: se pidió en el piloto para ir guardando los datos de la organización mientras se completan.
- `handleSave`: En edición se envía siempre, para que quitar exclusiones persista.
- `handleSave`: Asociación Nivel 2 recién creada con miembros pendientes: en vez de salir del wizard, se reinicia el formulario para capturar cada organización miembro (nombre + datos), ya enlazada a esta asociación.

### `src/modules/assessment-core/presentation/pages/profile-action-plan.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `fmtDay(value)` (interno) | función | Inicio y fin de una medida: días de calendario, sin zona horaria. |
| `ProfileActionPlanPage()` | componente | Plan de acción consolidado de una organización (pedido en el piloto, HU-57): las medidas de las tres herramientas en una sola vista, agrupadas por herramienta y por evaluación. Es de consulta; cada grupo enlaza al plan de su herramienta, que es donde se registra el avance. |

Notas:

- `ProfileActionPlanPage`: Por herramienta, y dentro de ella por evaluación (de la más reciente a la más antigua): el backend ya entrega ese orden.


## src/modules/auth

### `src/modules/auth/application/auth-context.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AuthContextValue` | tipo |  |
| `AuthProvider({ children })` | componente | Fuente única de verdad de la sesión: token de acceso corto en memoria (renovado con la cookie HttpOnly de refresh) + perfil (/auth/me). Expone la misma forma que usan las páginas (currentUser.accessToken, organisations.current, isActuallySuperAdmin). |
| `useAuth()` | función | Acceso a la sesión |

Campos:

- `AuthContextValue.resumeSession`: Reanuda la sesión caducada sin salir de la pantalla en la que se está.
- `AuthContextValue.reloadProjects`: Vuelve a leer los proyectos (p. ej. después de crear uno).
- `AuthContextValue.currentRoles`: Roles del usuario en la organización actual.
- `AuthContextValue.canAdminister`: Administra el proyecto actual: assessment_admin, o el superadministrador que lo creó. Un superadministrador en un proyecto ajeno es un miembro más.
- `AuthContextValue.isReadOnly`: Visualizador: solo consulta, no puede crear ni calificar.

Notas:

- `hydrate`: El superadministrador entra a los proyectos que creó (la API solo le lista esos) además de aquellos de los que es miembro: sin esto no podía entrar a uno que acababa de crear.
- `AuthProvider`: Al cargar: intenta renovar con la cookie; sin cookie → anónimo.
- `AuthProvider`: Versiones anteriores guardaban el JWT en localStorage.
- `AuthProvider`: Cada renovación silenciosa actualiza el token que ven las páginas (y el socket de tiempo real); si la renovación falla, la sesión se cierra.
- `AuthProvider`: Antes se cerraba la sesión aquí mismo. Eso desmontaba la aplicación y se perdía lo que hubiera en pantalla sin guardar; ahora solo se marca como caducada y el diálogo pide la clave.
- `AuthProvider`: Las consultas se guardan por proyecto, no por usuario: sin vaciarlas, quien entra después en el mismo navegador (un equipo compartido en el taller) veía las organizaciones del usuario anterior hasta recargar la página.
- `AuthProvider`: Reanudar no es volver a entrar: se conserva la organización actual y se refrescan las consultas que hayan fallado mientras la sesión estaba caída.
- `AuthProvider`: El proyecto actual se conserva: hydrate lo recupera de localStorage.

### `src/modules/auth/application/organisations-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `organisationsKeys` | constante | Claves de caché |
| `organisationsQueries` | constante | Consultas de proyectos |

### `src/modules/auth/application/users-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `usersKeys` | constante | Claves de caché |
| `usersQueries` | constante | Consultas de usuarios |

### `src/modules/auth/domain/auth.types.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AuthenticatedUser` | tipo |  |
| `OrganisationAccess` | tipo |  |
| `OrganisationRoles` | tipo |  |
| `AuthSession` | tipo |  |
| `AuthState` | tipo |  |

Campos:

- `AuthState.roles`: Roles de evaluación por organización (assessment_admin / assessment_evaluator).
- `AuthState.isActuallySuperAdmin`: true si el usuario real es superadmin global.
- `AuthState.ownedProjects`: Proyectos que creó el superadministrador: solo en esos tiene acceso total.
- `AuthState.sessionExpired`: El token caducó y no se pudo renovar estando dentro de la aplicación. La sesión NO se cierra: la pantalla se queda como estaba y se pide la contraseña para seguir, porque cerrarla perdería lo que hubiera sin guardar.

### `src/modules/auth/infrastructure/auth-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `loginWithPassword(email, password)` | función | Inicia sesión |
| `loginWithGoogle(idToken)` | función | Inicia sesión con Google |
| `MeResponse` | tipo |  |
| `fetchMe(token)` | función | Perfil y roles |
| `logoutSession()` | función | Cierra la sesión en el servidor (revoca el refresh token de la cookie). |
| `fetchAuthProviders()` | función | Proveedores |

Notas:

- `parse`: cuerpo vacío
- `logoutSession`: sin red: la sesión local se cierra igual

### `src/modules/auth/infrastructure/organisations-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `Organisation` | tipo | Organización (inquilino) con el volumen de datos que contiene. |
| `CreateOrganisationInput` | tipo |  |
| `ProvisionedTemplate` | tipo |  |
| `CreateOrganisationResult` | tipo |  |
| `fetchOrganisations(token?)` | función | Proyectos |
| `createOrganisation(data, token?)` | función | Crea |
| `updateOrganisation(id, data, token?)` | función | Renombra |
| `provisionOrganisation(id, token?)` | función | Reaplica las plantillas base sobre una organización existente. |
| `AssignableUser` | tipo | Usuario ya creado en la plataforma, para asignarlo a un proyecto. |
| `fetchAssignableUsers(search?, token?)` | función | Cuentas asignables |

### `src/modules/auth/infrastructure/users-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentRoleCode` | tipo |  |
| `ViewerVisibility` | tipo | Qué organizaciones evaluadas ve un visualizador. |
| `OrganisationUser` | tipo |  |
| `CreateUserInput` | tipo |  |
| `UpdateUserInput` | tipo |  |
| `fetchOrganisationUsers(org, token?)` | función | Usuarios |
| `createOrganisationUser(org, data, token?)` | función | Crea o agrega |
| `updateOrganisationUser(org, id, data, token?)` | función | Edita |
| `removeOrganisationUser(org, id, token?)` | función | Saca del proyecto |
| `setViewerVisibility(org, id, data, token?)` | función | Define qué organizaciones evaluadas ve un usuario con rol de visualizador. |

Notas:

- Solo en el rol de visualizador.

### `src/modules/auth/presentation/google-sign-in-button.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GoogleSignInButton({ onError, })` | componente | Botón "Iniciar sesión con Google" (Google Identity Services). Carga el script bajo demanda y entrega el id_token al backend (POST /auth/google). |

### `src/modules/auth/presentation/login-page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `LoginPage()` | componente | Pantalla de acceso |

### `src/modules/auth/presentation/organisations/assignable-user-list.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssignableUserList({ users, loading, pickedId, onPick, name)` | componente | Buscador y lista de cuentas existentes para elegir una. Lo usan el equipo del proyecto (asignar usuario) y el alta de proyecto (elegir administrador). |

Notas:

- `AssignableUserList`: Nombre del grupo de radios; distinto por formulario.

### `src/modules/auth/presentation/organisations/organisations.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `slugify(name)` (interno) | función | Sugiere un identificador a partir del nombre escrito. |
| `OrganisationsPage()` | componente | Alta y mantenimiento de proyectos (inquilinos). Solo superadmin, y cada uno ve únicamente los proyectos que creó. Un proyecto nuevo nace con sus tres plantillas y su administrador, y desde aquí mismo se le asignan usuarios existentes o se crean nuevos. |

Notas:

- `OrganisationsPage`: Paso siguiente natural: armar el equipo del proyecto recién creado.
- `OrganisationFormDialog`: Uno mismo ya es la opción «Yo».
- `OrganisationFormDialog`: Solo se envían los datos del modo elegido: una cuenta existente conserva su nombre y su contraseña.
- `create`: El proyecto nuevo aparece en el selector sin volver a entrar.

### `src/modules/auth/presentation/organisations/project-members-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ProjectMembersDialog({ organisation, onOpenChange, onChanged,)` | componente | Desde «Gestión de proyectos» el superadministrador arma el equipo de cada proyecto que creó: asigna usuarios que ya existen en la plataforma, crea usuarios nuevos y, a los visualizadores, les habilita qué organizaciones evaluadas pueden ver. |

Notas:

- `add`: Lo que ve el visualizador se marcó junto con el rol.

### `src/modules/auth/presentation/session-expired-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SessionExpiredDialog({ email, onResume, onLogout, })` | componente | La sesión caducó estando dentro de la aplicación. En vez de mandar al usuario a la pantalla de acceso —lo que desmonta todo y se lleva por delante el formulario a medio llenar—, se bloquea la pantalla con este diálogo: se escribe la contraseña y se sigue exactamente donde se estaba. No se puede cerrar con Escape ni clicando fuera: mientras la sesión no se reanude, cualquier cosa que se intente guardar fallaría. |

### `src/modules/auth/presentation/users/roles.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ROLE_OPTIONS` | constante | Etiquetas y descripciones vienen del diccionario (app.users.role*). |
| `roleTone(role)` | función | Color del rótulo de cada rol en la tabla. |
| `roleOf(u)` | función | Rol principal de un usuario |

### `src/modules/auth/presentation/users/users.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `UsersPage()` | componente | Administración de usuarios y permisos de la organización actual. |

Campos:

- `FormValues.visibility`: Solo para el rol de visualizador: qué organizaciones evaluadas ve.

Notas:

- `UsersPage`: Solo el superadministrador dueño del proyecto otorga superadministrador.
- `UsersPage`: La cuenta de un superadministrador (contraseña, activación) solo la toca otro superadministrador; aquí se gestiona su rol.
- `UsersPage`: Lo que ve el visualizador se eligió en el mismo formulario.

### `src/modules/auth/presentation/users/viewer-visibility-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `NO_VISIBILITY` | constante | Sin organizaciones habilitadas |
| `viewerVisibilityOf(user)` | función | Visibilidad de un usuario |
| `useVisibilitySummary()` | función | Texto corto de lo que ve un visualizador, para la tabla de usuarios. |
| `normalizeVisibility(v)` | función | Lo que se guarda: con "todas" la lista no hace falta. |
| `ViewerScopePicker({ org, value, onChange, listClassName, })` | componente | Lista de casillas con las organizaciones evaluadas del proyecto: un administrador (o el superadministrador dueño del proyecto) elige cuáles ve el visualizador, o todas, incluidas las que se registren después. Se usa dentro del formulario del usuario y en el diálogo de visibilidad. |
| `ViewerVisibilityDialog({ org, user, onOpenChange, onSaved, })` | componente | Diálogo para cambiar después lo que ve un visualizador existente. |


## src/modules/capacity-tool

### `src/modules/capacity-tool/application/capacity-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `capacityQueries` | constante | Consultas de la herramienta |

### `src/modules/capacity-tool/domain/capacity-tool-ui.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CAPACITY_TOOL_UI` | constante | Definición de la herramienta en la interfaz |

### `src/modules/capacity-tool/infrastructure/capacity-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `capacityApi` | constante | Instancia de la API genérica de herramientas por KPI. Los nombres con prefijo se conservan para los consumidores existentes. |
| `{
  fetchTemplates: fetchCapacityTemplates,
  createSection: createCapacitySection,
  updateSection: updateCapacitySection,
  deleteSection: deleteCapacitySection,
  createIndicator: createCapacityIndicator,
  updateIndicator: updateCapacityIndicator,
  deleteIndicator: deleteCapacityIndicator,
  fetchEvaluations: fetchCapacityEvaluations,
  fetchEvaluation: fetchCapacityEvaluation,
  fetchEvaluationHistory: fetchCapacityEvaluationHistory,
  createEvaluation: createCapacityEvaluation,
  upsertResponses: upsertCapacityResponses,
  completeEvaluation: completeCapacityEvaluation,
  fetchSummary: fetchCapacitySummary,
  fetchOrganisationsOverview: fetchCapacityOrganisationsOverview,
  fetchMeasures: fetchCapacityMeasures,
  createMeasure: createCapacityMeasure,
  updateMeasureProgress: updateCapacityMeasureProgress,
  improveObservation: improveCapacityObservation,
  suggestMeasuresForSection: suggestCapacityMeasuresForArea,
  suggestMeasuresForEvaluation: suggestCapacityMeasuresForEvaluation,
  fetchImpactPriority: fetchCapacityImpactPriority,
  detectInconsistencies: detectCapacityInconsistencies,
  generateExecutiveNarrative: generateCapacityExecutiveNarrative,
  exportSummary: exportCapacitySummary,
  exportSummaryPptx: exportCapacitySummaryPptx,
}` | constante |  |
| `CapacityToolOrganisationRow` | tipo |  |
| `CapacityToolOrganisationsOverview` | tipo |  |
| `CapacityToolMeasure` | tipo |  |
| `CreateCapacityToolMeasureInput` | tipo |  |
| `UpdateCapacityToolMeasureInput` | tipo |  |
| `CapacityToolMeasureSuggestion` | tipo |  |
| `CapacityToolEvaluationSuggestion` | tipo |  |
| `CapacityToolImpactPriorityItem` | tipo |  |

### `src/modules/capacity-tool/presentation/pages/capacity-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityTemplateAdminPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityActionPlanPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-measureId.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityMeasureDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/capacity-tool/presentation/pages/capacity-evaluationId-area-number.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityAreaAnalysisPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/capacity-tool/presentation/pages/capacity-evaluationId-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityEvaluationDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/capacity-tool/presentation/pages/capacity-evaluationId-summary.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacitySummaryPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/capacity-tool/presentation/pages/capacity-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityPanelGeneralPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |


## src/modules/indicator-tool

### `src/modules/indicator-tool/domain/indicator-tool-ui.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolUi` | tipo | Todo lo que distingue a la Herramienta Organizativa de la de Capacidades en la interfaz: segmento de ruta, prefijo de traducciones, API, queries y número de secciones. Las páginas de `presentation/pages` son genéricas y reciben esta definición (mismo patrón que EvaluationToolDefinition en el backend). |

Campos:

- `IndicatorToolUi.sectionCount`: Columnas de sección en el panel general.

### `src/modules/indicator-tool/infrastructure/indicator-tool-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolSlug` | tipo | API de las herramientas basadas en KPI (Organizativa y de Capacidades): las rutas y los contratos son idénticos; solo cambia el segmento de la herramienta y el nombre del segmento de sección (dimensions \| areas). |
| `IndicatorToolOrganisationRow` | tipo |  |
| `IndicatorToolOrganisationsOverview` | tipo |  |
| `IndicatorToolMeasure` | tipo |  |
| `CreateIndicatorToolMeasureInput` | tipo |  |
| `UpdateIndicatorToolMeasureInput` | tipo |  |
| `IndicatorToolMeasureSuggestion` | tipo |  |
| `IndicatorToolEvaluationSuggestion` | tipo |  |
| `IndicatorToolImpactPriorityItem` | tipo |  |
| `createIndicatorToolApi(slug, sectionSegment)` | función | Crea el cliente de una herramienta por KPI |
| `IndicatorToolApi` | tipo |  |

Notas:

- `fetchTemplates`: Estructura (plantilla, secciones, KPI)
- `fetchOrganisationsOverview`: Panel general (panel general)
- `fetchMeasures`: Plan de mitigación simplificado
- `improveObservation`: Asistencia con IA

### `src/modules/indicator-tool/presentation/pages/indicator-tool-action-plan.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolActionPlanPage({ def })` | componente | Plan de acción |

Notas:

- `IndicatorToolActionPlanPage`: Tras crear/actualizar medidas: refresca medidas, evaluación y panel.

### `src/modules/indicator-tool/presentation/pages/indicator-tool-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolAdminPage({ def })` | componente | Estructura de la herramienta |

### `src/modules/indicator-tool/presentation/pages/indicator-tool-evaluation.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolEvaluationPage({ def })` | componente | Calificación |

Notas:

- `IndicatorToolEvaluationPage`: Una evaluación completada tiene sus puntajes congelados (el servidor rechaza cambios): se abre para consultar lo que se calificó ese día.
- `loadEvaluation`: Completada: se muestra exactamente lo que guardó el servidor. Un borrador local ya no se podría guardar, así que se descarta.
- `loadEvaluation`: Si la sesión se cerró por accidente con cambios sin guardar, se recuperan por encima de lo que ya confirmó el servidor.
- `IndicatorToolEvaluationPage`: Persiste el borrador en cada cambio, para sobrevivir un cierre de sesión accidental.
- `IndicatorToolEvaluationPage`: FE7-B01: sesión colaborativa — si otro facilitador califica un KPI de esta misma evaluación, la recargamos en vivo. Si el usuario actual tiene cambios locales sin guardar, no la pisamos: solo avisamos (el fix de "Unsaved changes" de esta misma sesión existe justamente para que ese aviso sea confiable).
- `IndicatorToolEvaluationPage`: RNF-03: reintenta lo que quedó pendiente en la cola local (por ejemplo, de una sesión anterior sin red) apenas monta y cada vez que vuelve la conexión — nunca se pierde una calificación por caída de red.
- `saveDimension`: RNF-03: un error de red (no un rechazo del servidor) no debe frenar el taller — se guarda localmente y se reintenta solo.
- `IndicatorToolEvaluationPage`: Guardado automático (pedido en el piloto): a los pocos segundos sin cambios se guarda la sección en curso. Solo si lo calificado ya tiene lo obligatorio; si falta, se espera sin mostrar error (el error aparece al pulsar Guardar o Siguiente). Si el servidor lo rechaza, no se reintenta hasta el siguiente cambio, para no repetir el aviso en bucle.
- `IndicatorToolEvaluationPage`: No se puede avanzar de dimensión (ni ver el resumen) si falta calificar algún KPI que cuente: los no aplicables al perfil y los desactivados en la plantilla se excluyen y no bloquean el avance. El botón "Guardar" sigue permitiendo progreso parcial: esta validación solo aplica a "Siguiente".
- `IndicatorToolEvaluationPage`: Promedio ponderado por el peso de cada KPI, el mismo que calcula el servidor para el resumen y el historial.

### `src/modules/indicator-tool/presentation/pages/indicator-tool-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolListPage({ def })` | componente | Panel general de la herramienta |

Notas:

- `IndicatorToolListPage`: Descarga el panel consolidado de las organizaciones en esta herramienta.

### `src/modules/indicator-tool/presentation/pages/indicator-tool-measure-detail.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolMeasureDetailPage({ def, })` | componente | Detalle de una medida |

Notas:

- `IndicatorToolMeasureDetailPage`: El formulario se inicializa con la medida cargada (y al cambiar de medida).

### `src/modules/indicator-tool/presentation/pages/indicator-tool-section.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolSectionPage({ def })` | componente | Análisis de una sección |

### `src/modules/indicator-tool/presentation/pages/indicator-tool-summary.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolSummaryPage({ def })` | componente | Resumen ejecutivo |

Notas:

- `IndicatorToolSummaryPage`: Determinístico, sin costo de IA — se carga junto al resumen.
- `IndicatorToolSummaryPage`: Tras completar o planificar: refresca evaluación, prioridad, historial y panel.
- `IndicatorToolSummaryPage`: Antes de completar, el módulo de IA revisa si hay contradicciones entre KPI relacionados (S9 del cronograma de tesis). Si no encuentra nada, no agrega fricción y completa directo.
- `handleComplete`: La revisión de consistencia con IA es una ayuda, no una barrera: si falla, no impide completar.
- `IndicatorToolSummaryPage`: Volver a tomar la evaluación: un ciclo nuevo para la misma organización. El anterior no se toca — queda en el historial, que es justo lo que se está mirando cuando se pulsa este botón.
- `IndicatorToolSummaryPage`: Planificar medida desde un KPI crítico (popup con el problema cargado) ──


## src/modules/organizational-tool

### `src/modules/organizational-tool/application/organizational-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `organizationalQueries` | constante | Consultas de la herramienta |

### `src/modules/organizational-tool/domain/organizational-tool-ui.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ORGANIZATIONAL_TOOL_UI` | constante | Definición de la herramienta en la interfaz |

### `src/modules/organizational-tool/infrastructure/organizational-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `organizationalApi` | constante | Instancia de la API genérica de herramientas por KPI. Los nombres con prefijo se conservan para los consumidores existentes. |
| `{
  fetchTemplates: fetchOrganizationalTemplates,
  createSection: createOrganizationalSection,
  updateSection: updateOrganizationalSection,
  deleteSection: deleteOrganizationalSection,
  createIndicator: createOrganizationalIndicator,
  updateIndicator: updateOrganizationalIndicator,
  deleteIndicator: deleteOrganizationalIndicator,
  fetchEvaluations: fetchOrganizationalEvaluations,
  fetchEvaluation: fetchOrganizationalEvaluation,
  fetchEvaluationHistory: fetchOrganizationalEvaluationHistory,
  createEvaluation: createOrganizationalEvaluation,
  upsertResponses: upsertOrganizationalResponses,
  completeEvaluation: completeOrganizationalEvaluation,
  fetchSummary: fetchOrganizationalSummary,
  fetchOrganisationsOverview: fetchOrganizationalOrganisationsOverview,
  fetchMeasures: fetchOrganizationalMeasures,
  createMeasure: createOrganizationalMeasure,
  updateMeasureProgress: updateOrganizationalMeasureProgress,
  improveObservation: improveOrganizationalObservation,
  suggestMeasuresForSection: suggestOrganizationalMeasuresForDimension,
  suggestMeasuresForEvaluation: suggestOrganizationalMeasuresForEvaluation,
  fetchImpactPriority: fetchOrganizationalImpactPriority,
  detectInconsistencies: detectOrganizationalInconsistencies,
  generateExecutiveNarrative: generateOrganizationalExecutiveNarrative,
  exportSummary: exportOrganizationalSummary,
  exportSummaryPptx: exportOrganizationalSummaryPptx,
}` | constante |  |
| `OrganizationalToolOrganisationRow` | tipo |  |
| `OrganizationalToolOrganisationsOverview` | tipo |  |
| `OrganizationalToolMeasure` | tipo |  |
| `CreateOrganizationalToolMeasureInput` | tipo |  |
| `UpdateOrganizationalToolMeasureInput` | tipo |  |
| `OrganizationalToolMeasureSuggestion` | tipo |  |
| `OrganizationalToolEvaluationSuggestion` | tipo |  |
| `AssessmentImpactPriorityItem` | tipo |  |

### `src/modules/organizational-tool/presentation/pages/organizational-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalTemplateAdminPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalActionPlanPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-measureId.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalMeasureDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/organizational-tool/presentation/pages/organizational-evaluationId-dimension-number.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalDimensionAnalysisPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/organizational-tool/presentation/pages/organizational-evaluationId-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalEvaluationDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/organizational-tool/presentation/pages/organizational-evaluationId-summary.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalSummaryPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### `src/modules/organizational-tool/presentation/pages/organizational-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalPanelGeneralPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |


## src/modules/realtime

### `src/modules/realtime/application/use-assessment-session.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `useAssessmentSession(org, evaluationId, token, onScoreUpdated, currentUserId?)` | función | Sesión colaborativa del taller (doc ai-ssd 01 §3, 03 §7 F7a): cuando otro facilitador califica un KPI de la misma evaluación, este hook recibe score.updated y dispara onScoreUpdated para que el llamador refresque su estado local (la app no usa TanStack Query para evaluaciones, así que no hay cache que invalidar — el patrón es "avísame y yo recargo"). |

Notas:

- `useAssessmentSession`: baseURL puede ser relativo ("/api" con el proxy de Vite) o absoluto. El namespace del gateway es /assessments; el path de Socket.IO va bajo baseURL para que el proxy lo reenvíe al backend.
- `useAssessmentSession`: El servidor también avisa al autor del guardado; ese eco no trae nada nuevo y solo provocaría recargar la evaluación entera tras cada guardado.

### `src/modules/realtime/infrastructure/offline-queue.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `store` (interno) | constante | RNF-03 (F7-B03): las calificaciones del taller no deben perderse si la red se cae a mitad de guardar. Cada mutación que falla por un error de red (no por un rechazo del servidor) se persiste aquí en IndexedDB y se reintenta cuando vuelve la conexión — sin depender de que la pestaña siga abierta. |
| `shouldQueueOffline(error)` | función | Solo un error de red se encola. Si el servidor respondió (validación, permisos, evaluación cerrada), reintentar no lo arregla y hay que avisar. |
| `AssessmentQueuedSave` | tipo |  |
| `enqueueAssessmentSave(item)` | función | Encola un guardado |
| `getPendingAssessmentSaves(evaluationId)` | función | Pendientes |
| `removeAssessmentSave(id)` | función | Quita uno |
| `flushAssessmentQueue(evaluationId, send)` | función | Reintenta cada item pendiente de esta evaluación; los que fallan de nuevo (seguimos sin red) quedan en la cola para el próximo intento. |


## src/modules/risk-tool

### `src/modules/risk-tool/application/risk-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `riskQueries` | constante | Consultas de la herramienta |

Notas:

- Cronograma (Gantt) de las medidas de mitigación de una evaluación.

### `src/modules/risk-tool/infrastructure/risk-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `fetchRiskTemplates(org, token?)` | función | Herramienta de Riesgos (RF-05/RF-06) |
| `createRiskSection(org, templateId, data, token?)` | función | Agrega principio |
| `updateRiskSection(org, sectionId, data, confirm, token?)` | función | Edita principio |
| `deleteRiskSection(org, sectionId, confirm, token?)` | función | Borra principio |
| `createRiskIndicator(org, sectionId, data, token?)` | función | Agrega KPI |
| `updateRiskIndicator(org, indicatorId, data, confirm, token?)` | función | Edita KPI |
| `deleteRiskIndicator(org, indicatorId, confirm, token?)` | función | Desactiva KPI |
| `fetchRiskEvaluations(org, token?)` | función | Evaluaciones |
| `fetchRiskEvaluation(org, id, token?)` | función | Detalle |
| `fetchRiskEvaluationHistory(org, profileId, token?)` | función | Historial |
| `createRiskEvaluation(org, data, token?)` | función | Inicia o recupera |
| `AssessmentKpiResponseRiskInput` | tipo |  |
| `upsertRiskResponses(org, evaluationId, responses, token?)` | función | Califica |
| `completeRiskEvaluation(org, evaluationId, token?)` | función | Completa |
| `fetchRiskSummary(org, evaluationId, token?)` | función | Resumen |
| `RiskToolOrganisationRow` | tipo | Panel general (panel general) |
| `RiskToolOrganisationsOverview` | tipo |  |
| `fetchRiskOrganisationsOverview(org, token?)` | función | Panel general |
| `AssessmentRiskClass` | tipo | Riesgos y plan de mitigación (RF-05/RF-06) |
| `AssessmentMitigationMeasureData` | tipo |  |
| `AssessmentRiskData` | tipo |  |
| `fetchRiskRisks(org, evaluationId, token?)` | función | Riesgos |
| `CreateAssessmentRiskMeasureInput` | tipo |  |
| `UpdateAssessmentMitigationMeasureInput` | tipo |  |
| `createRiskMeasure(org, riskId, data, token?)` | función | Crea medida |
| `updateRiskMeasureProgress(org, measureId, data, token?)` | función | Registra avance |
| `fetchRiskGantt(org, evaluationId, token?)` | función | Cronograma |
| `improveRiskObservation(org, evaluationId, indicatorId, score, observation, token?)` | función | Asistencia con IA (Risk) |
| `RiskToolMeasureSuggestion` | tipo |  |
| `suggestRiskMeasuresForPrinciple(org, evaluationId, principleNumber, token?)` | función | Sugerencias por principio |
| `RiskToolEvaluationSuggestion` | tipo |  |
| `suggestRiskMeasuresForEvaluation(org, evaluationId, token?)` | función | Plan sugerido |
| `RiskToolImpactPriorityItem` | tipo |  |
| `fetchRiskImpactPriority(org, evaluationId, token?)` | función | Prioridad |
| `detectRiskInconsistencies` | constante | Contradicciones |
| `generateRiskExecutiveNarrative` | constante | Narrativa |
| `exportRiskMitigationPlan` | constante | Excel |
| `exportRiskMitigationPlanPptx` | constante | Presentación |
| `RiskCountryParam` | tipo | Parámetros de riesgo por país (administración) |
| `fetchRiskCountryParams(org, token?)` | función | Umbrales |
| `upsertRiskCountryParam(org, input, token?)` | función | Define umbral |
| `deleteRiskCountryParam(org, country, token?)` | función | Borra umbral |

### `src/modules/risk-tool/presentation/components/kpi-score-row-risk.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `KpiScoreRowRiskProps` (interno) | tipo | RF-05: misma tarjeta de indicador que Organizational (kpi-score-row.tsx), más los dos campos de riesgo obligatorios/opcionales que exige la Herramienta de Riesgos (riskDescription obligatoria, riskType opcional) — el servicio clasifica el riesgo y crea/actualiza AssessmentRisk a partir de estos dos campos al guardar. |
| `KpiScoreRowRisk({ indicatorId, number, name, description)` | componente | Tarjeta de KPI con riesgo |

Campos:

- `KpiScoreRowRiskProps.manualCritical`: El evaluador la marca a mano como "requiere atención", sin importar el score.
- `KpiScoreRowRiskProps.readOnly`: Evaluación completada: se ve la nota y lo registrado, sin poder cambiarlo.

### `src/modules/risk-tool/presentation/components/risk-country-params-card.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskCountryParamsCard()` | componente | Umbral de despreciabilidad por país: score > umbral ⇒ riesgo despreciable. Si un país no tiene fila, aplica el umbral de la plantilla (5). |

### `src/modules/risk-tool/presentation/components/section-panel-risk.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `DraftResponseRisk` | tipo |  |
| `PrincipleViewProps` (interno) | tipo | RF-05: vista de UN principio a la vez (wizard), mismo patrón que DimensionView de Organizational (section-panel.tsx) más los campos de riesgo por KPI. |
| `PrincipleView({ number, name, indicators, responses, t)` | componente | Un principio del asistente |

Campos:

- `PrincipleViewProps.readOnly`: Evaluación completada: los KPI se muestran sin poder editarse.

### `src/modules/risk-tool/presentation/pages/risk-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskTemplateAdminPage()` | componente | Estructura y umbrales |

### `src/modules/risk-tool/presentation/pages/risk-evaluationId-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskEvaluationDetailPage()` | componente | Calificación |

Notas:

- `RiskEvaluationDetailPage`: Una evaluación completada tiene sus puntajes congelados (el servidor rechaza cambios): se abre para consultar lo que se calificó ese día.
- `loadEvaluation`: La descripción/tipo de riesgo vive en AssessmentRisk, no en AssessmentResponse — se precarga desde el riesgo ya guardado (si existe) para que reabrir el borrador no exija volver a escribirla en cada KPI ya respondido.
- `loadEvaluation`: Completada: se muestra exactamente lo que guardó el servidor. Un borrador local ya no se podría guardar, así que se descarta.
- `loadEvaluation`: Si la sesión se cerró por accidente con cambios sin guardar, se recuperan por encima de lo que ya confirmó el servidor.
- `RiskEvaluationDetailPage`: Persiste el borrador en cada cambio, para sobrevivir un cierre de sesión accidental.
- `RiskEvaluationDetailPage`: FE7-B01: sesión colaborativa — si otro facilitador califica un KPI de esta misma evaluación, la recargamos en vivo. Si el usuario actual tiene cambios locales sin guardar, no la pisamos: solo avisamos.
- `RiskEvaluationDetailPage`: RNF-03: reintenta lo que quedó pendiente en la cola local (por ejemplo, de una sesión anterior sin red) apenas monta y cada vez que vuelve la conexión — nunca se pierde una calificación por caída de red.
- `RiskEvaluationDetailPage`: Guardado automático (pedido en el piloto): a los pocos segundos sin cambios se guarda la sección en curso. Solo si lo calificado ya tiene lo obligatorio; si falta, se espera sin mostrar error (el error aparece al pulsar Guardar o Siguiente). Si el servidor lo rechaza, no se reintenta hasta el siguiente cambio, para no repetir el aviso en bucle.
- `RiskEvaluationDetailPage`: No se puede avanzar de principio (ni ver el resumen) si falta calificar algún KPI aplicable — los marcados applicable=false por la aplicabilidad del perfil se excluyen y no bloquean el avance. "Guardar" sigue permitiendo progreso parcial: esta validación solo aplica a "Siguiente".
- `RiskEvaluationDetailPage`: Promedio ponderado por el peso de cada KPI, el mismo que calcula el servidor para el resumen y el historial.

### `src/modules/risk-tool/presentation/pages/risk-evaluationId-mitigation.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `daysUntil(value, now)` (interno) | función | Días enteros de `now` a `value` (negativo si ya pasó), como el Gantt. |
| `RiskMitigationPage()` | componente | Plan de mitigación |
| `MeasureCardStatus({ measure, now, t, })` (interno) | componente | Lo que cada columna necesita contar de una medida: si una pendiente ya debió empezar, cuánto le queda o cuánto se atrasó la que está en curso, y en la concluida, qué se implementó y si dejó medio de verificación. |

Notas:

- `RiskMitigationPage`: Tras crear/actualizar medidas: refresca riesgos, Gantt, evaluación y panel.
- `RiskMitigationPage`: Una sola referencia de "hoy" para todas las tarjetas del tablero.

### `src/modules/risk-tool/presentation/pages/risk-evaluationId-principle-number.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskPrincipleAnalysisPage()` | componente | Análisis de un principio |

### `src/modules/risk-tool/presentation/pages/risk-evaluationId-summary.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskSummaryPage()` | componente | Resumen ejecutivo |

Notas:

- `RiskSummaryPage`: Determinístico, sin costo de IA — se carga junto al resumen.
- `RiskSummaryPage`: Tras completar o planificar: refresca evaluación, prioridad, historial y panel.
- `RiskSummaryPage`: Antes de completar, el módulo de IA revisa si hay contradicciones entre KPI relacionados (S9 del cronograma de tesis). Si no encuentra nada, no agrega fricción y completa directo.
- `handleComplete`: La revisión de consistencia con IA es una ayuda, no una barrera: si falla, no impide completar.
- `RiskSummaryPage`: Volver a tomar la evaluación: un ciclo nuevo para la misma organización. El anterior no se toca — queda en el historial, que es justo lo que se está mirando cuando se pulsa este botón.
- `RiskSummaryPage`: Planificar medida desde un KPI crítico (popup con el problema cargado) ──

### `src/modules/risk-tool/presentation/pages/risk-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskPanelGeneralPage()` | componente | Panel general |


## src/shared/api

### `src/shared/api/auth-base.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `resolveAuthBase(apiUrl, sameOrigin)` | función | Base de las rutas /auth que usan la cookie de sesión. En Vercel la web las pide a su propio dominio (vercel.json las reenvía a Heroku): así la cookie es propia y los navegadores que bloquean las de terceros (Safari, Firefox estricto, Brave) no cierran la sesión (HU-71). El resto de la API sigue yendo directo al servidor. |
| `authBase` | constante | Base efectiva de las rutas de sesión |

### `src/shared/api/http-client.ts`

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

### `src/shared/api/session-token.ts`

Token de acceso en memoria (nunca en localStorage): la sesión persiste con el refresh token que el backend guarda en una cookie HttpOnly y rota en cada renovación. Este módulo es la única fuente del token para la capa HTTP.

| Elemento | Tipo | Qué es |
|---|---|---|
| `oneTabAtATime(task)` (interno) | función | Las pestañas comparten la cookie, así que se turnan para renovar: la segunda espera y manda ya la cookie nueva. Si el navegador no tiene Web Locks, el servidor admite renovaciones simultáneas durante unos segundos. |
| `sessionToken` | constante | Token en memoria, con suscripción |
| `refreshAccessToken()` | función | Pide un token de acceso nuevo con la cookie de refresh. Varias llamadas concurrentes (p. ej. 3 peticiones que reciben 401 a la vez) comparten la misma renovación. Devuelve null si no hay sesión. |
| `authorizedFetch(url, init, explicitToken?)` | función | fetch con Authorization y un reintento transparente tras renovar el token cuando el backend responde 401 (token de acceso vencido). |

Notas:

- `refreshAccessToken`: Una petición colgada no deja esperando a las demás pestañas.


## src/shared/components

### `src/shared/components/bar-line-chart.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `BarLineChart({ chartData, barColor, lineColor = "#174)` | componente | Evolución en el tiempo en barras (una por corte, con el color de su nivel) y una línea encima que une los resultados para ver la tendencia. |

Campos:

- `BarLineChartProps.barColor`: Color de cada barra según su valor (por ejemplo, el del semáforo).

### `src/shared/components/page-header-context.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `PageHeaderProvider({ children })` | componente | Guarda el nombre destacado |
| `usePageHeaderName()` | función | Lee el nombre destacado actual (lo usa el AppShell para mostrarlo en el navbar). |
| `useSetPageHeaderName(name)` | función | Las páginas de una organización/evaluación puntual llaman esto para destacar su nombre en el navbar mientras están montadas. |

### `src/shared/components/page-title.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `PageTitle({ rawTitle, title })` | componente | Título y descripción de página |

### `src/shared/components/require-role.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `NoAccess({ message })` (interno) | componente | Pantallas de administración: el menú ya las esconde según el rol, pero alguien puede llegar por la dirección. El servidor rechaza sus acciones; aquí se evita mostrar formularios que no se pueden usar. |
| `RequireAdmin({ children })` | componente | Administrador del proyecto (o superadministrador de la plataforma). |
| `RequireSuperAdmin({ children })` | componente | Superadministrador de la plataforma. |


## src/shared/config

### `src/shared/config/route-keys.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `routeKeys` | enumeración | Rutas del router (deben coincidir con los archivos de src/routes). |

Notas:

- Núcleo: perfiles, panel consolidado, administración
- Herramienta Organizativa
- Herramienta de Capacidades
- Herramienta de Riesgos


## src/shared/design

### `src/shared/design/score-colors.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `SCORE_COLORS` | constante | Colores semánticos de puntaje, en hex para usarlos en SVG/canvas y estilos inline (los tokens HSL de index.css tienen el mismo tono). |
| `scoreColor(value)` | función | Color según el puntaje |

Notas:

- 0–5
- 5–7
- 7–10


## src/shared/i18n

### `src/shared/i18n/i18n.tsx`

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


## src/shared/lib

### `src/shared/lib/date-only.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `DATE_ONLY` (interno) | constante | Fechas de calendario (inicio y fin de una medida, semana de inicio de una mitigación): el servidor las guarda como medianoche UTC («2026-11-10T00:00:00.000Z»). Leídas con `new Date()`, en Ecuador (UTC−5) esa medianoche cae a las 19:00 del día anterior y la pantalla mostraba un día menos. Aquí se toman solo el año, el mes y el día, en la hora local. |
| `parseDateOnly(value)` | función | Fecha de calendario sin zona horaria |
| `formatDateOnly(value, locale?, options?)` | función | Fecha de calendario lista para mostrar; «—» si no es válida. |
| `toInputDate(date)` | función | Día local en el formato de `&lt;input type="date">` (AAAA-MM-DD). |

### `src/shared/lib/draft-storage.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `PREFIX` (interno) | constante | Borradores persistidos en localStorage: si la sesión se cierra por accidente (token vencido, pestaña cerrada, refresh) mientras se llena el wizard de una organización o se puntúa una evaluación, los datos no capturados por el servidor todavía se recuperan al volver a entrar. `localStorage` puede no estar disponible (modo privado, cuota llena) — nunca debe romper la app. |
| `loadDraft(key)` | función | Lee un borrador |
| `saveDraft(key, value)` | función | Lo guarda |
| `clearDraft(key)` | función | Lo borra |

Notas:

- `saveDraft`: localStorage lleno o inaccesible: el borrador simplemente no persiste.

### `src/shared/lib/http-response-error.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `HttpResponseError` | clase | Lanzado por el cliente HTTP cuando el servidor responde con estado no-OK, para que la UI pueda decidir por estado (p.ej. 403) sin parsear mensajes. |
| `isHttpResponseError(value)` | función | Si el error es de respuesta HTTP |

### `src/shared/lib/utils.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `cn(inputs)` | función | Une clases CSS |
| `formatDecimal(value, decimals)` | función | Número con decimales |

### `src/shared/lib/web-url.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `webUrl(text)` | función | Dirección web válida (http o https), normalizada; null si no lo es. |


## src/shared/query

### `src/shared/query/tool-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ToolReadApi` | tipo | Fábrica de queries de React Query para una herramienta de evaluación. Las tres herramientas exponen la misma API de lectura, así que las claves y las opciones (staleTime, enabled) se definen una sola vez. Las mutaciones de cada página invalidan por clave: `invalidateEvaluation(queryClient, org, id)`. |
| `createToolQueries(tool, api)` | función | Crea las consultas de una herramienta |

Notas:

- datos que cambian al evaluar
- plantillas
- `invalidateEvaluation`: Tras puntuar, completar o planificar: refresca todo lo de la evaluación.
- `invalidateAll`: Tras crear una evaluación o editar la estructura.


## Raíz

### `vite.config.ts`

Notas:

- Cada ruta se carga bajo demanda (chunk por pantalla).
- Librerías pesadas en chunks propios y cacheables.
- En desarrollo el frontend habla con el backend en el mismo origen vía proxy; VITE_API_URL vacío usa este proxy.
- La cookie de refresh se emite con Path=/auth; detrás del proxy el navegador la necesita en /api/auth para enviarla al renovar.
- Mínimos actuales: solo pueden subir. La cobertura de la web es baja (las páginas no tienen pruebas); subirlos a medida que se agreguen. Vitest 4 ya cuenta las ramas y funciones de los archivos sin pruebas (antes salían casi al 100 %): con las mismas pruebas, 45 y 25 pasaron a 5,8 y 5,9.

