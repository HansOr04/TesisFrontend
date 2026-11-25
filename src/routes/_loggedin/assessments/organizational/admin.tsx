import { createFileRoute } from "@tanstack/react-router";
import { RequireAdmin } from "@/shared/components/require-role";
import { OrganizationalTemplateAdminPage } from "@/modules/organizational-tool/presentation/pages/organizational-admin.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/organizational/admin"
)({
  component: () => (
    <RequireAdmin>
      <OrganizationalTemplateAdminPage />
    </RequireAdmin>
  ),
});
