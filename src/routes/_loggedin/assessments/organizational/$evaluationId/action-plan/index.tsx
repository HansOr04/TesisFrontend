import { createFileRoute } from "@tanstack/react-router";
import { OrganizationalActionPlanPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-list.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/organizational/$evaluationId/action-plan/"
)({
  component: OrganizationalActionPlanPage,
});
