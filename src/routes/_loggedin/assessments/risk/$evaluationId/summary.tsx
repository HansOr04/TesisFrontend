import { createFileRoute } from "@tanstack/react-router";
import { RiskSummaryPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-summary.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/risk/$evaluationId/summary"
)({
  component: RiskSummaryPage,
});
