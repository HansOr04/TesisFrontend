# indicator-tool


## Dominio

### indicator-tool-ui.ts

`src/modules/indicator-tool/domain/indicator-tool-ui.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolUi` | tipo | Todo lo que distingue a la Herramienta Organizativa de la de Capacidades en la interfaz: segmento de ruta, prefijo de traducciones, API, queries y número de secciones. Las páginas de `presentation/pages` son genéricas y reciben esta definición (mismo patrón que EvaluationToolDefinition en el backend). |

Campos:

- `IndicatorToolUi.sectionCount`: Columnas de sección en el panel general.


## Infraestructura

### indicator-tool-api.ts

`src/modules/indicator-tool/infrastructure/indicator-tool-api.ts`

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


## Presentación

### indicator-tool-action-plan.page.tsx

`src/modules/indicator-tool/presentation/pages/indicator-tool-action-plan.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolActionPlanPage({ def })` | componente | Plan de acción |

Notas:

- `IndicatorToolActionPlanPage`: Tras crear/actualizar medidas: refresca medidas, evaluación y panel.

### indicator-tool-admin.page.tsx

`src/modules/indicator-tool/presentation/pages/indicator-tool-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolAdminPage({ def })` | componente | Estructura de la herramienta |

### indicator-tool-evaluation.page.tsx

`src/modules/indicator-tool/presentation/pages/indicator-tool-evaluation.page.tsx`

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

### indicator-tool-list.page.tsx

`src/modules/indicator-tool/presentation/pages/indicator-tool-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolListPage({ def })` | componente | Panel general de la herramienta |

Notas:

- `IndicatorToolListPage`: Descarga el panel consolidado de las organizaciones en esta herramienta.

### indicator-tool-measure-detail.page.tsx

`src/modules/indicator-tool/presentation/pages/indicator-tool-measure-detail.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolMeasureDetailPage({ def, })` | componente | Detalle de una medida |

Notas:

- `IndicatorToolMeasureDetailPage`: El formulario se inicializa con la medida cargada (y al cambiar de medida).

### indicator-tool-section.page.tsx

`src/modules/indicator-tool/presentation/pages/indicator-tool-section.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `IndicatorToolSectionPage({ def })` | componente | Análisis de una sección |

### indicator-tool-summary.page.tsx

`src/modules/indicator-tool/presentation/pages/indicator-tool-summary.page.tsx`

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
