import { createFileRoute } from "@tanstack/react-router";
import { RequireAdmin } from "@/shared/components/require-role";
import { CapacityTemplateAdminPage } from "@/modules/capacity-tool/presentation/pages/capacity-admin.page";

export const Route = createFileRoute("/_loggedin/assessments/capacity/admin")({
  component: () => (
    <RequireAdmin>
      <CapacityTemplateAdminPage />
    </RequireAdmin>
  ),
});
