import { createFileRoute } from "@tanstack/react-router";
import { RiskPanelGeneralPage } from "@/modules/risk-tool/presentation/pages/risk-list.page";

export const Route = createFileRoute("/_loggedin/assessments/risk/")({
  component: RiskPanelGeneralPage,
});
