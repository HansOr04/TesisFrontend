import { queryOptions } from "@tanstack/react-query";
import { createToolQueries } from "@/shared/query/tool-queries";
import {
  fetchRiskEvaluation,
  fetchRiskEvaluationHistory,
  fetchRiskGantt,
  fetchRiskImpactPriority,
  fetchRiskRisks,
  fetchRiskOrganisationsOverview,
  fetchRiskTemplates,
} from "../infrastructure/risk-api";

const base = createToolQueries("risk", {
  fetchOrganisationsOverview: fetchRiskOrganisationsOverview,
  fetchEvaluation: fetchRiskEvaluation,
  fetchMeasures: fetchRiskRisks,
  fetchEvaluationHistory: fetchRiskEvaluationHistory,
  fetchTemplates: fetchRiskTemplates,
  fetchImpactPriority: fetchRiskImpactPriority,
});

export const riskQueries = {
  ...base,
  /** Cronograma (Gantt) de las medidas de mitigación de una evaluación. */
  gantt: (org: string | undefined, evaluationId: string) =>
    queryOptions({
      queryKey: [...base.keys.evaluation(org ?? "", evaluationId), "gantt"],
      queryFn: () => fetchRiskGantt(org as string, evaluationId),
      enabled: Boolean(org && evaluationId),
      staleTime: 30 * 1000,
    }),
};
