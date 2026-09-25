import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RiskPanelGeneralPage } from "@/modules/risk-tool/presentation/pages/risk-list.page";

export const Route = createFileRoute(routeKeys.riskTool)({
  component: RiskPanelGeneralPage,
});
