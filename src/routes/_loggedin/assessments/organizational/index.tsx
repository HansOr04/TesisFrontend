import { createFileRoute } from "@tanstack/react-router";
import { OrganizationalPanelGeneralPage } from "@/modules/organizational-tool/presentation/pages/organizational-list.page";

export const Route = createFileRoute("/_loggedin/assessments/organizational/")({
  component: OrganizationalPanelGeneralPage,
});
