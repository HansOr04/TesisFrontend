import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RiskTemplateAdminPage } from "@/modules/risk-tool/presentation/pages/risk-admin.page";

export const Route = createFileRoute(routeKeys.riskToolAdmin)({
  component: RiskTemplateAdminPage,
});
