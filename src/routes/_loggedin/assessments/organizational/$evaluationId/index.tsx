import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganizationalEvaluationDetailPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-list.page";

export const Route = createFileRoute(routeKeys.organizationalToolEvaluationId)({
  component: OrganizationalEvaluationDetailPage,
});
