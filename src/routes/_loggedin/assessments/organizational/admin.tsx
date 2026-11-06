import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RequireAdmin } from "@/shared/components/require-role";
import { OrganizationalTemplateAdminPage } from "@/modules/organizational-tool/presentation/pages/organizational-admin.page";

export const Route = createFileRoute(routeKeys.organizationalToolAdmin)({
  component: () => (
    <RequireAdmin>
      <OrganizationalTemplateAdminPage />
    </RequireAdmin>
  ),
});
