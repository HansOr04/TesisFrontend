import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RiskSummaryPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-summary.page";

export const Route = createFileRoute(routeKeys.riskToolSummary)({
  component: RiskSummaryPage,
});
