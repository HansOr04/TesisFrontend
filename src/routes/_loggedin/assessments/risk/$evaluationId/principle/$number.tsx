import { createFileRoute } from "@tanstack/react-router";
import { RiskPrincipleAnalysisPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-principle-number.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/risk/$evaluationId/principle/$number"
)({
  component: RiskPrincipleAnalysisPage,
});
