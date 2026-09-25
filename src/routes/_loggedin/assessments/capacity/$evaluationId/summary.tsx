import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { CapacitySummaryPage } from "@/modules/capacity-tool/presentation/pages/capacity-evaluationId-summary.page";

export const Route = createFileRoute(routeKeys.capacityToolSummary)({
  component: CapacitySummaryPage,
});
