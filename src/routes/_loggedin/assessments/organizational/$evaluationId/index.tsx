import { createFileRoute } from "@tanstack/react-router";
import { OrganizationalEvaluationDetailPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-list.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/organizational/$evaluationId/"
)({
  component: OrganizationalEvaluationDetailPage,
});
