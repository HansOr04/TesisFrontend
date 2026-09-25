import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { CapacityPanelGeneralPage } from "@/modules/capacity-tool/presentation/pages/capacity-list.page";

export const Route = createFileRoute(routeKeys.capacityTool)({
  component: CapacityPanelGeneralPage,
});
