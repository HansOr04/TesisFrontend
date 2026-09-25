import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganizationalPanelGeneralPage } from "@/modules/organizational-tool/presentation/pages/organizational-list.page";

export const Route = createFileRoute(routeKeys.organizationalTool)({
  component: OrganizationalPanelGeneralPage,
});
