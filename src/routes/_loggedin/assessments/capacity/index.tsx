import { createFileRoute } from "@tanstack/react-router";
import { CapacityPanelGeneralPage } from "@/modules/capacity-tool/presentation/pages/capacity-list.page";

export const Route = createFileRoute("/_loggedin/assessments/capacity/")({
  component: CapacityPanelGeneralPage,
});
