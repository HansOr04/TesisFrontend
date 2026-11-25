# assessment-core


## Dominio

### kpi-scope.ts

`src/modules/assessment-core/domain/kpi-scope.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `countsInEvaluation(indicator)` | función | Un KPI entra en la evaluación cuando se cumplen las dos condiciones, que son independientes entre sí: - `active`: sigue vigente en la plantilla de la organización. Desactivarlo desde Administración lo apaga para todo el mundo, sin borrarlo. - `applicable`: aplica a esta organización evaluada en concreto, según lo que se marcó en «KPI aplicables». El backend ya las usa juntas para puntuar y para exigir completitud; el formulario tiene que mirar las mismas dos, o acabaría pidiendo calificar un KPI que después no cuenta para nada. |

### section-average.ts

`src/modules/assessment-core/domain/section-average.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `weightedSectionAverage(indicators, scores)` | función | Promedio de una sección ponderado por el peso de cada KPI, el mismo que calcula el servidor para el resumen y el historial. Solo cuentan los KPI ya calificados; sin ninguno, el promedio es 0. El peso llega del servidor como texto («7»), porque Prisma serializa los Decimal así aunque el tipo diga number. Sin el Number() la suma de pesos concatena («0777…») y el promedio queda en 0.0 con la sección calificada. |


## Aplicación

### core-queries.ts

`src/modules/assessment-core/application/core-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `coreKeys` | constante | Queries del núcleo (perfiles y panel consolidado). |
| `coreQueries` | constante | Consultas de organizaciones y panel |


## Infraestructura

### assessment-api.ts

`src/modules/assessment-core/infrastructure/assessment-api.ts`

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

### assessment-roles-api.ts

`src/modules/assessment-core/infrastructure/assessment-roles-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentUserRoleAssignment` | tipo | La asignación de roles de evaluación pasa siempre por /:org/assessments/roles: ahí se aplican el permiso de administración, la auditoría y la protección al revocar a quien tiene evaluaciones activas. |
| `assessmentRoleAssignmentsQueryOptions(organisation, token?)` | función | Consulta de asignaciones |
| `fetchAssessmentRoleAssignments(organisation, token?)` | función | Lista |
| `assignAssessmentRole(organisation, userId, roleCode, token?)` | función | Asigna |
| `revokeAssessmentRole(organisation, id, confirm, token?)` | función | Revoca |

### tool-common-api.ts

`src/modules/assessment-core/infrastructure/tool-common-api.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `detectInconsistenciesFor(tool)` | función | Capacidades que las tres herramientas exponen con la misma forma: se construyen por segmento de ruta ("organizational" \| "capacity" \| "risk"). |
| `generateExecutiveNarrativeFor(tool)` | función | Pide la narrativa |
| `exportSummaryFor(tool, path, filePrefix)` | función | Descarga el Excel |
| `ReportGanttScope` | tipo | Alcance del Gantt del reporte; debe coincidir con el DTO del backend. |
| `exportSummaryPptxFor(tool, path, filePrefix)` | función | Descarga la presentación |


## Presentación

### applicability-dialog.tsx

`src/modules/assessment-core/presentation/components/applicability-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ApplicabilityDialog({ profile, open, onOpenChange, onSaved, )` | componente | Editar qué KPI aplican a una organización ya creada. Los KPI marcados como "no aplica" no se exigen al completar la evaluación ni entran en el puntaje. |

### applicability-editor.tsx

`src/modules/assessment-core/presentation/components/applicability-editor.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ApplicabilityToolKey` | tipo |  |
| `ApplicabilityEditorProps` | tipo |  |
| `ApplicabilityEditor({ excludedSectionIds, excludedIndicatorI)` | componente | Editor de KPI aplicables por organización: carga la plantilla activa de cada herramienta y permite marcar secciones enteras o KPI individuales como "no aplica". Controlado: el padre guarda los sets de exclusión. |

Notas:

- `ApplicabilityEditor`: `t` se usa como variable de iteración en este archivo: la traducción es `tr`.
- `ApplicabilityEditor`: Un KPI desactivado en la plantilla sigue en la lista para poder verlo y decidir, pero se marca porque no cuenta en las evaluaciones nuevas.

### assign-evaluator-dialog.tsx

`src/modules/assessment-core/presentation/components/assign-evaluator-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssignEvaluatorDialog({ organisation, profile, open, onOpenCha)` | componente | Asignar evaluador y confidencialidad |

Notas:

- `AssignEvaluatorDialog`: El dato «confidencial» solo lo cambia el superadministrador dueño del proyecto.

### complete-evaluation-dialog.tsx

`src/modules/assessment-core/presentation/components/complete-evaluation-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CompleteEvaluationDialog({ open, onOpenChange, onConfirm, answere)` | componente | Doble confirmación antes de completar una evaluación: completarla la cierra (queda en el historial en solo lectura), así que primero se muestra un resumen de lo calificado y después se pide confirmar de forma explícita. |

### consolidated-table.tsx

`src/modules/assessment-core/presentation/components/consolidated-table.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ConsolidatedTable({ rows, t, onOpenEvaluation, })` | componente | Tabla del panel consolidado |

### critical-kpi-panel.tsx

`src/modules/assessment-core/presentation/components/critical-kpi-panel.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CriticalKpiPanel({ criticalIndicators, sections, sectionL)` | componente | Panel interactivo de KPI críticos: filtro por sección, búsqueda, orden por severidad, distribución de puntajes y tarjetas expandibles con la observación completa y acciones (ir a la sección, planificar medida). |

Campos:

- `CriticalKpiPanelProps.sectionLabel`: Etiqueta de la sección: "Dimensión" \| "Área" \| "Principio".
- `CriticalKpiPanelProps.onPlanMeasure`: Si se pasa, cada tarjeta ofrece "Planificar medida".
- `CriticalKpiPanelProps.indicatorsWithMeasure`: Ids de indicadores que ya tienen una medida registrada.

### evolution-history.tsx

`src/modules/assessment-core/presentation/components/evolution-history.tsx`

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

### executive-summary.tsx

`src/modules/assessment-core/presentation/components/executive-summary.tsx`

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

### export-report-dialog.tsx

`src/modules/assessment-core/presentation/components/export-report-dialog.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `GanttScope` | tipo | Qué abarca el Gantt del reporte. Debe coincidir con el DTO del backend. |
| `ExportReportDialog({ open, onOpenChange, onConfirm, exporti)` | componente | El reporte siempre lleva el mismo contenido; lo único que se elige al generarlo es hasta dónde llega el Gantt del plan de acción, porque a veces interesa el plan de esta evaluación y a veces el de toda la organización o el del proyecto entero. |

### gantt-chart.tsx

`src/modules/assessment-core/presentation/components/gantt-chart.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RED` (interno) | constante | Cronograma de mitigación/acción (RF-06, luego rediseñado): barra horizontal por medida, posicionada por CSS (offset%/ancho% dentro del rango total de fechas) — sin librería de gráficos, mismo criterio de "SVG/CSS propio" ya usado en gauge.tsx. El color de cada barra refleja el CUMPLIMIENTO DE PLAZO, no el % de avance ni el status crudo: risk = completada, rojo = plazo vencido sin completar (atrasada), ámbar = en curso/pendiente pero todavía dentro de plazo. Mismos hex que gauge.tsx para mantener el mismo lenguaje visual que los badges de puntaje KPI. |
| `GanttChart({ measures, statusLabel, emptyLabel, tod)` | componente | Cronograma |

Notas:

- `startOfWeek`: semana empieza en lunes
- `GanttChart`: En pantallas angostas el cronograma se desplaza dentro de su caja en vez de ensanchar toda la página (HU-58).
- `width`: ancho mínimo visible

### gauge.tsx

`src/modules/assessment-core/presentation/components/gauge.tsx`

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

### impact-priority-panel.tsx

`src/modules/assessment-core/presentation/components/impact-priority-panel.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ImpactPriorityDisplayItem` | tipo |  |
| `ImpactPriorityPanel({ items, t, onPlanMeasure, })` | componente | Ranking de KPI críticos por impacto (peso × brecha bajo el umbral): podio con los 3 primeros, barras relativas al máximo, filtro por sección y lista colapsable para no abrumar cuando hay decenas de KPI. |

Campos:

- `ImpactPriorityPanelProps.onPlanMeasure`: Abre el plan para crear la medida de este KPI.

### kpi-help-rubric-buttons.tsx

`src/modules/assessment-core/presentation/components/kpi-help-rubric-buttons.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `parseRubricCriteria(text)` (interno) | función | Rúbrica analítica: scoringRubric guarda un JSON `{"criteria": ["...", ...]}` con 3-5 criterios verificables específicos del KPI (no una sola descripción holística por puntaje). Se muestran como checklist; el puntaje 1-10 depende de cuántos criterios se cumplen (leyenda genérica, no repetida por KPI). |
| `parseRubricBands(text)` (interno) | función | Formato legado "10 = descripción.\n7-8 = descripción...." — se mantiene como fallback para cualquier KPI que aún no se haya migrado a criterios. |
| `KpiHelpRubricButtons({ helpText, scoringRubric, t, })` | componente | FE3-B03 (rediseño): dos botones ícono junto al nombre del KPI, siempre visibles — Ayuda (qué documento/proceso debe existir) y Rúbrica (cómo interpretar la escala 1-10). Compartido por Organizativa/Capacidades (kpi-score-row.tsx) y Risk (kpi-score-row-risk.tsx) para no duplicar el Dialog. |

Notas:

- `parseRubricCriteria`: No es JSON: puede ser una rúbrica antigua en formato "10 = ...".

### kpi-score-row.tsx

`src/modules/assessment-core/presentation/components/kpi-score-row.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `KpiScoreRowProps` (interno) | tipo | FE3-B03: tarjeta de indicador — colapsada muestra número + nombre + descripción; al expandir muestra 10 botones de calificación (1-10) y la observación obligatoria (UCA-04). Sin botón de guardado individual: el padre agrega los cambios de toda la dimensión y los guarda con un solo botón "Guardar". |
| `KpiScoreRow({ indicatorId, number, name, description)` | componente | Tarjeta de calificación de un KPI |

Campos:

- `KpiScoreRowProps.manualCritical`: El evaluador la marca a mano como "requiere atención", sin importar el score.
- `KpiScoreRowProps.readOnly`: Evaluación completada: se ve la nota y lo registrado, sin poder cambiarlo.

### measure-progress-dialog.tsx

`src/modules/assessment-core/presentation/components/measure-progress-dialog.tsx`

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

### plan-measure-dialog.tsx

`src/modules/assessment-core/presentation/components/plan-measure-dialog.tsx`

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

### ring-gauge.tsx

`src/modules/assessment-core/presentation/components/ring-gauge.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RingGaugeProps` (interno) | tipo | Anillo de progreso circular (0–10). Con `label` muestra el texto debajo; en tamaños pequeños (tarjetas de KPI) se usa sin etiqueta y con trazo fino. |
| `RingGauge({ value, label, size = 110, strokeWidth )` | componente | Anillo de progreso |

Campos:

- `RingGaugeProps.value`: 0-10
- `RingGaugeProps.integer`: Muestra el valor como entero (p.ej. "4") en vez de "4.0".

### section-panel.tsx

`src/modules/assessment-core/presentation/components/section-panel.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `DraftResponse` | tipo |  |
| `DimensionViewProps` (interno) | tipo | FE3-B03/B04: vista de UNA dimensión a la vez (wizard), replicando el diseño de Figma — nada de acordeón con las 6 dimensiones abiertas a la vez. |
| `DimensionView({ number, name, indicators, responses, t)` | componente | Una sección del asistente |

Campos:

- `DimensionViewProps.readOnly`: Evaluación completada: los KPI se muestran sin poder editarse.
- `DimensionViewProps.labels`: Sobrescribe las etiquetas específicas de Organizational ("Dimensión", "KPI completados") para reutilizar este componente en Capacity ("Área") sin duplicarlo.

### template-admin.tsx

`src/modules/assessment-core/presentation/components/template-admin.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentTemplateAdmin({ toolTitle, sectionLabel, onBack, fetch)` | componente | Consumido por app/src/routes/_loggedin/assessments/{organizational,risk,capacity}/admin.tsx — un único componente de administración de estructura (secciones + KPI) para las 3 herramientas, ya que AssessmentSection/AssessmentIndicator son modelos compartidos y el backend ya expone el CRUD completo (versionado copy-on-write: editar una plantilla ya evaluada crea una nueva versión en vez de mutar la existente). |

Notas:

- `AssessmentTemplateAdmin`: Sección
- `AssessmentTemplateAdmin`: Indicador

### admin-global.page.tsx

`src/modules/assessment-core/presentation/pages/admin-global.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentAdminGlobalPage()` | componente | RF-08: «Gestionar organizaciones» del Administrador de plataforma — lista las organizaciones Assessment de TODOS los clientes (no solo la organización activa en el selector), excluyendo las marcadas como confidenciales. El backend (RequireGlobalSuperAdmin) es la fuente real de verdad del acceso; esta página solo se enlaza en el menú para superadmins. Editar una organización cambia primero al proyecto al que pertenece, porque el formulario de edición trabaja sobre el proyecto activo. |

### associations-profileId.page.tsx

`src/modules/assessment-core/presentation/pages/associations-profileId.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssociationDetailPage()` | componente | Panel de una asociación |

### dashboard.page.tsx

`src/modules/assessment-core/presentation/pages/dashboard.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentDashboardPage()` | componente | Panel consolidado |

### home.page.tsx

`src/modules/assessment-core/presentation/pages/home.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `AssessmentProfilesPage()` | componente | Lista de organizaciones |

Notas:

- `AssessmentProfilesPage`: Elegir el evaluador responsable es del administrador; el servidor rechaza el cambio si lo intenta un evaluador.
- `AssessmentProfilesPage`: Asociaciones Nivel 2 agrupan otras organizaciones (Nivel 1 o empresas) como miembros vía parentProfileId. Se muestran como acordeón para que se vea de un vistazo qué organizaciones pertenecen a cuál asociación.

### new.page.tsx

`src/modules/assessment-core/presentation/pages/new.page.tsx`

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

### profile-action-plan.page.tsx

`src/modules/assessment-core/presentation/pages/profile-action-plan.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `fmtDay(value)` (interno) | función | Inicio y fin de una medida: días de calendario, sin zona horaria. |
| `ProfileActionPlanPage()` | componente | Plan de acción consolidado de una organización (pedido en el piloto, HU-57): las medidas de las tres herramientas en una sola vista, agrupadas por herramienta y por evaluación. Es de consulta; cada grupo enlaza al plan de su herramienta, que es donde se registra el avance. |

Notas:

- `ProfileActionPlanPage`: Por herramienta, y dentro de ella por evaluación (de la más reciente a la más antigua): el backend ya entrega ese orden.
