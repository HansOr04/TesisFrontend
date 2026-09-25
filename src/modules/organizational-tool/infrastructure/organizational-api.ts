import {
  createIndicatorToolApi,
  type CreateIndicatorToolMeasureInput,
  type IndicatorToolEvaluationSuggestion,
  type IndicatorToolImpactPriorityItem,
  type IndicatorToolMeasure,
  type IndicatorToolMeasureSuggestion,
  type IndicatorToolOrganisationRow,
  type IndicatorToolOrganisationsOverview,
  type UpdateIndicatorToolMeasureInput,
} from "@/modules/indicator-tool/infrastructure/indicator-tool-api";

// Instancia de la API genérica de herramientas por KPI. Los nombres con
// prefijo se conservan para los consumidores existentes.
export const organizationalApi = createIndicatorToolApi(
  "organizational",
  "dimensions"
);

export const {
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
} = organizationalApi;

export type OrganizationalToolOrganisationRow = IndicatorToolOrganisationRow;
export type OrganizationalToolOrganisationsOverview =
  IndicatorToolOrganisationsOverview;
export type OrganizationalToolMeasure = IndicatorToolMeasure;
export type CreateOrganizationalToolMeasureInput =
  CreateIndicatorToolMeasureInput;
export type UpdateOrganizationalToolMeasureInput =
  UpdateIndicatorToolMeasureInput;
export type OrganizationalToolMeasureSuggestion =
  IndicatorToolMeasureSuggestion;
export type OrganizationalToolEvaluationSuggestion =
  IndicatorToolEvaluationSuggestion;
export type AssessmentImpactPriorityItem = IndicatorToolImpactPriorityItem;
export type {
  AssessmentInconsistencyFinding,
  NarrativeTone,
} from "@/modules/assessment-core/infrastructure/assessment-api";
