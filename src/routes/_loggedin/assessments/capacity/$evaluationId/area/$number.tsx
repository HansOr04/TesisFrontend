import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { CapacityAreaAnalysisPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-area-number.page";

export const Route = createFileRoute(routeKeys.capacityToolAreaAnalysis)({
  component: CapacityAreaAnalysisPage,
});
