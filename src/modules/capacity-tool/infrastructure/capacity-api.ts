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
export const capacityApi = createIndicatorToolApi("capacity", "areas");

export const {
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
} = capacityApi;

export type CapacityToolOrganisationRow = IndicatorToolOrganisationRow;
export type CapacityToolOrganisationsOverview =
  IndicatorToolOrganisationsOverview;
export type CapacityToolMeasure = IndicatorToolMeasure;
export type CreateCapacityToolMeasureInput = CreateIndicatorToolMeasureInput;
export type UpdateCapacityToolMeasureInput = UpdateIndicatorToolMeasureInput;
export type CapacityToolMeasureSuggestion = IndicatorToolMeasureSuggestion;
export type CapacityToolEvaluationSuggestion =
  IndicatorToolEvaluationSuggestion;
export type CapacityToolImpactPriorityItem = IndicatorToolImpactPriorityItem;
export type {
  AssessmentInconsistencyFinding,
  NarrativeTone,
} from "@/modules/assessment-core/infrastructure/assessment-api";
