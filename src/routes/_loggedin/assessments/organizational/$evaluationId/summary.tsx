import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganizationalSummaryPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-summary.page";

export const Route = createFileRoute(routeKeys.organizationalToolSummary)({
  component: OrganizationalSummaryPage,
});
