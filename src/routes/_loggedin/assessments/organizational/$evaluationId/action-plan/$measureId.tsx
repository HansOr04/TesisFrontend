import { createFileRoute } from "@tanstack/react-router";
import { OrganizationalMeasureDetailPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-measureId.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/organizational/$evaluationId/action-plan/$measureId"
)({ component: OrganizationalMeasureDetailPage });
