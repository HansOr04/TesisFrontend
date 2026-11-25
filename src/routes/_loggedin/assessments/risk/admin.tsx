import { createFileRoute } from "@tanstack/react-router";
import { RequireAdmin } from "@/shared/components/require-role";
import { RiskTemplateAdminPage } from "@/modules/risk-tool/presentation/pages/risk-admin.page";

export const Route = createFileRoute("/_loggedin/assessments/risk/admin")({
  component: () => (
    <RequireAdmin>
      <RiskTemplateAdminPage />
    </RequireAdmin>
  ),
});
