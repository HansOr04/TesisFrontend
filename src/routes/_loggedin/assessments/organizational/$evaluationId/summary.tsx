import { createFileRoute } from "@tanstack/react-router";
import { OrganizationalSummaryPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-summary.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/organizational/$evaluationId/summary"
)({
  component: OrganizationalSummaryPage,
});
