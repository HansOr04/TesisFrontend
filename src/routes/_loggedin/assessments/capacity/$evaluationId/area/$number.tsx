import { createFileRoute } from "@tanstack/react-router";
import { CapacityAreaAnalysisPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-area-number.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/capacity/$evaluationId/area/$number"
)({
  component: CapacityAreaAnalysisPage,
});
