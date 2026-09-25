import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganizationalActionPlanPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-list.page";

export const Route = createFileRoute(routeKeys.organizationalToolActionPlan)({
  component: OrganizationalActionPlanPage,
});
