import { createToolQueries } from "@/shared/query/tool-queries";
import {
  fetchOrganizationalEvaluation,
  fetchOrganizationalEvaluationHistory,
  fetchOrganizationalImpactPriority,
  fetchOrganizationalMeasures,
  fetchOrganizationalOrganisationsOverview,
  fetchOrganizationalTemplates,
} from "../infrastructure/organizational-api";

export const organizationalQueries = createToolQueries("organizational", {
  fetchOrganisationsOverview: fetchOrganizationalOrganisationsOverview,
  fetchEvaluation: fetchOrganizationalEvaluation,
  fetchMeasures: fetchOrganizationalMeasures,
  fetchEvaluationHistory: fetchOrganizationalEvaluationHistory,
  fetchTemplates: fetchOrganizationalTemplates,
  fetchImpactPriority: fetchOrganizationalImpactPriority,
});
