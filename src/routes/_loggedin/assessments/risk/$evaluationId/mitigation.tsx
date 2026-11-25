import { createFileRoute } from "@tanstack/react-router";
import { RiskMitigationPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-mitigation.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/risk/$evaluationId/mitigation"
)({
  component: RiskMitigationPage,
});
