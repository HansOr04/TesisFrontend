import { createFileRoute } from "@tanstack/react-router";
import { CapacityEvaluationDetailPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-list.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/capacity/$evaluationId/"
)({
  component: CapacityEvaluationDetailPage,
});
