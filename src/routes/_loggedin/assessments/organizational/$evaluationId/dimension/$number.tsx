import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganizationalDimensionAnalysisPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-dimension-number.page";

export const Route = createFileRoute(
  routeKeys.organizationalToolDimensionAnalysis
)({ component: OrganizationalDimensionAnalysisPage });
