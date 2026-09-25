import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { CapacityMeasureDetailPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-measureId.page";

export const Route = createFileRoute(routeKeys.capacityToolMeasureDetail)({
  component: CapacityMeasureDetailPage,
});
