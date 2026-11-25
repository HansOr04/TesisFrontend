import { createFileRoute } from "@tanstack/react-router";
import { CapacitySummaryPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-summary.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/capacity/$evaluationId/summary"
)({
  component: CapacitySummaryPage,
});
