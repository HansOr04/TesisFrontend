# capacity-tool


## Dominio

### capacity-tool-ui.ts

`src/modules/capacity-tool/domain/capacity-tool-ui.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CAPACITY_TOOL_UI` | constante | Definición de la herramienta en la interfaz |


## Aplicación

### capacity-queries.ts

`src/modules/capacity-tool/application/capacity-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `capacityQueries` | constante | Consultas de la herramienta |


## Infraestructura

### capacity-api.ts

`src/modules/capacity-tool/infrastructure/capacity-api.ts`

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


## Presentación

### capacity-admin.page.tsx

`src/modules/capacity-tool/presentation/pages/capacity-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityTemplateAdminPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### capacity-evaluationId-action-plan-list.page.tsx

`src/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityActionPlanPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### capacity-evaluationId-action-plan-measureId.page.tsx

`src/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-measureId.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityMeasureDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### capacity-evaluationId-area-number.page.tsx

`src/modules/capacity-tool/presentation/pages/capacity-evaluationId-area-number.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityAreaAnalysisPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### capacity-evaluationId-list.page.tsx

`src/modules/capacity-tool/presentation/pages/capacity-evaluationId-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityEvaluationDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### capacity-evaluationId-summary.page.tsx

`src/modules/capacity-tool/presentation/pages/capacity-evaluationId-summary.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacitySummaryPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### capacity-list.page.tsx

`src/modules/capacity-tool/presentation/pages/capacity-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `CapacityPanelGeneralPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |
