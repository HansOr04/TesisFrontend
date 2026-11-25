import { createFileRoute } from "@tanstack/react-router";
import { CapacityActionPlanPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-action-plan-list.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/capacity/$evaluationId/action-plan/"
)({
  component: CapacityActionPlanPage,
});
