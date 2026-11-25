import { createFileRoute } from "@tanstack/react-router";
import { OrganizationalDimensionAnalysisPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-dimension-number.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/organizational/$evaluationId/dimension/$number"
)({ component: OrganizationalDimensionAnalysisPage });
