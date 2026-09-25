import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RiskPrincipleAnalysisPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-principle-number.page";

export const Route = createFileRoute(routeKeys.riskToolPrincipleAnalysis)({
  component: RiskPrincipleAnalysisPage,
});
