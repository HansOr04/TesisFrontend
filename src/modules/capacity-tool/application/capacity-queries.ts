import { createToolQueries } from "@/shared/query/tool-queries";
import {
  fetchCapacityEvaluation,
  fetchCapacityEvaluationHistory,
  fetchCapacityImpactPriority,
  fetchCapacityMeasures,
  fetchCapacityOrganisationsOverview,
  fetchCapacityTemplates,
} from "../infrastructure/capacity-api";

export const capacityQueries = createToolQueries("capacity", {
  fetchOrganisationsOverview: fetchCapacityOrganisationsOverview,
  fetchEvaluation: fetchCapacityEvaluation,
  fetchMeasures: fetchCapacityMeasures,
  fetchEvaluationHistory: fetchCapacityEvaluationHistory,
  fetchTemplates: fetchCapacityTemplates,
  fetchImpactPriority: fetchCapacityImpactPriority,
});
