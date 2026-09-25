import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RiskMitigationPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-mitigation.page";

export const Route = createFileRoute(routeKeys.riskToolMitigation)({
  component: RiskMitigationPage,
});
