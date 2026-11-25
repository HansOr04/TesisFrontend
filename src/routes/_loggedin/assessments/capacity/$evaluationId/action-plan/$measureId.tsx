import { createFileRoute } from "@tanstack/react-router";
import { CapacityMeasureDetailPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-measureId.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/capacity/$evaluationId/action-plan/$measureId"
)({
  component: CapacityMeasureDetailPage,
});
