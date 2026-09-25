import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganizationalTemplateAdminPage } from "@/modules/organizational-tool/presentation/pages/organizational-admin.page";

export const Route = createFileRoute(routeKeys.organizationalToolAdmin)({
  component: OrganizationalTemplateAdminPage,
});
