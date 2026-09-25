import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { CapacityTemplateAdminPage } from "@/modules/capacity-tool/presentation/pages/capacity-admin.page";

export const Route = createFileRoute(routeKeys.capacityToolAdmin)({
  component: CapacityTemplateAdminPage,
});
