import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { CapacityEvaluationDetailPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-list.page";

export const Route = createFileRoute(routeKeys.capacityToolEvaluationId)({
  component: CapacityEvaluationDetailPage,
});
