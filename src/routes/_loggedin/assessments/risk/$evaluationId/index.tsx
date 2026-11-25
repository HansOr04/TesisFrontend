import { createFileRoute } from "@tanstack/react-router";
import { RiskEvaluationDetailPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-list.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/risk/$evaluationId/"
)({
  component: RiskEvaluationDetailPage,
});
