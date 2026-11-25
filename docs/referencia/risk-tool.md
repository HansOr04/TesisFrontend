# risk-tool


## Aplicación

### risk-queries.ts

`src/modules/risk-tool/application/risk-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `riskQueries` | constante | Consultas de la herramienta |

Notas:

- Cronograma (Gantt) de las medidas de mitigación de una evaluación.


## Infraestructura

### risk-api.ts

`src/modules/risk-tool/infrastructure/risk-api.ts`

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


## Presentación

### kpi-score-row-risk.tsx

`src/modules/risk-tool/presentation/components/kpi-score-row-risk.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `KpiScoreRowRiskProps` (interno) | tipo | RF-05: misma tarjeta de indicador que Organizational (kpi-score-row.tsx), más los dos campos de riesgo obligatorios/opcionales que exige la Herramienta de Riesgos (riskDescription obligatoria, riskType opcional) — el servicio clasifica el riesgo y crea/actualiza AssessmentRisk a partir de estos dos campos al guardar. |
| `KpiScoreRowRisk({ indicatorId, number, name, description)` | componente | Tarjeta de KPI con riesgo |

Campos:

- `KpiScoreRowRiskProps.manualCritical`: El evaluador la marca a mano como "requiere atención", sin importar el score.
- `KpiScoreRowRiskProps.readOnly`: Evaluación completada: se ve la nota y lo registrado, sin poder cambiarlo.

### risk-country-params-card.tsx

`src/modules/risk-tool/presentation/components/risk-country-params-card.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskCountryParamsCard()` | componente | Umbral de despreciabilidad por país: score > umbral ⇒ riesgo despreciable. Si un país no tiene fila, aplica el umbral de la plantilla (5). |

### section-panel-risk.tsx

`src/modules/risk-tool/presentation/components/section-panel-risk.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `DraftResponseRisk` | tipo |  |
| `PrincipleViewProps` (interno) | tipo | RF-05: vista de UN principio a la vez (wizard), mismo patrón que DimensionView de Organizational (section-panel.tsx) más los campos de riesgo por KPI. |
| `PrincipleView({ number, name, indicators, responses, t)` | componente | Un principio del asistente |

Campos:

- `PrincipleViewProps.readOnly`: Evaluación completada: los KPI se muestran sin poder editarse.

### risk-admin.page.tsx

`src/modules/risk-tool/presentation/pages/risk-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskTemplateAdminPage()` | componente | Estructura y umbrales |

### risk-evaluationId-list.page.tsx

`src/modules/risk-tool/presentation/pages/risk-evaluationId-list.page.tsx`

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

### risk-evaluationId-mitigation.page.tsx

`src/modules/risk-tool/presentation/pages/risk-evaluationId-mitigation.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `daysUntil(value, now)` (interno) | función | Días enteros de `now` a `value` (negativo si ya pasó), como el Gantt. |
| `RiskMitigationPage()` | componente | Plan de mitigación |
| `MeasureCardStatus({ measure, now, t, })` (interno) | componente | Lo que cada columna necesita contar de una medida: si una pendiente ya debió empezar, cuánto le queda o cuánto se atrasó la que está en curso, y en la concluida, qué se implementó y si dejó medio de verificación. |

Notas:

- `RiskMitigationPage`: Tras crear/actualizar medidas: refresca riesgos, Gantt, evaluación y panel.
- `RiskMitigationPage`: Una sola referencia de "hoy" para todas las tarjetas del tablero.

### risk-evaluationId-principle-number.page.tsx

`src/modules/risk-tool/presentation/pages/risk-evaluationId-principle-number.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskPrincipleAnalysisPage()` | componente | Análisis de un principio |

### risk-evaluationId-summary.page.tsx

`src/modules/risk-tool/presentation/pages/risk-evaluationId-summary.page.tsx`

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

### risk-list.page.tsx

`src/modules/risk-tool/presentation/pages/risk-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `RiskPanelGeneralPage()` | componente | Panel general |
