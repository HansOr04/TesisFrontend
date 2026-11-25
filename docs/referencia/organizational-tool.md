# organizational-tool


## Dominio

### organizational-tool-ui.ts

`src/modules/organizational-tool/domain/organizational-tool-ui.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `ORGANIZATIONAL_TOOL_UI` | constante | Definición de la herramienta en la interfaz |


## Aplicación

### organizational-queries.ts

`src/modules/organizational-tool/application/organizational-queries.ts`

| Elemento | Tipo | Qué es |
|---|---|---|
| `organizationalQueries` | constante | Consultas de la herramienta |


## Infraestructura

### organizational-api.ts

`src/modules/organizational-tool/infrastructure/organizational-api.ts`

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


## Presentación

### organizational-admin.page.tsx

`src/modules/organizational-tool/presentation/pages/organizational-admin.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalTemplateAdminPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### organizational-evaluationId-action-plan-list.page.tsx

`src/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalActionPlanPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### organizational-evaluationId-action-plan-measureId.page.tsx

`src/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-measureId.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalMeasureDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### organizational-evaluationId-dimension-number.page.tsx

`src/modules/organizational-tool/presentation/pages/organizational-evaluationId-dimension-number.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalDimensionAnalysisPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### organizational-evaluationId-list.page.tsx

`src/modules/organizational-tool/presentation/pages/organizational-evaluationId-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalEvaluationDetailPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### organizational-evaluationId-summary.page.tsx

`src/modules/organizational-tool/presentation/pages/organizational-evaluationId-summary.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalSummaryPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |

### organizational-list.page.tsx

`src/modules/organizational-tool/presentation/pages/organizational-list.page.tsx`

| Elemento | Tipo | Qué es |
|---|---|---|
| `OrganizationalPanelGeneralPage()` | componente | Monta la página genérica de indicator-tool con la definición de la herramienta |
