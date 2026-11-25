import { createFileRoute } from "@tanstack/react-router";
import { RequireSuperAdmin } from "@/shared/components/require-role";
import { AssessmentAdminGlobalPage } from "@/modules/assessment-core/presentation/pages/admin-global.page";

export const Route = createFileRoute("/_loggedin/assessments/admin-global")({
  component: () => (
    <RequireSuperAdmin>
      <AssessmentAdminGlobalPage />
    </RequireSuperAdmin>
  ),
});
