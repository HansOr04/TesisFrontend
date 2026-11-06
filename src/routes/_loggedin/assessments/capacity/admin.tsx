import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RequireAdmin } from "@/shared/components/require-role";
import { CapacityTemplateAdminPage } from "@/modules/capacity-tool/presentation/pages/capacity-admin.page";

export const Route = createFileRoute(routeKeys.capacityToolAdmin)({
  component: () => (
    <RequireAdmin>
      <CapacityTemplateAdminPage />
    </RequireAdmin>
  ),
});
