import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { CapacityActionPlanPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-list.page";

export const Route = createFileRoute(routeKeys.capacityToolActionPlan)({
  component: CapacityActionPlanPage,
});
