import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganizationalMeasureDetailPage } from "@/modules/organizational-tool/presentation/pages/organizational-evaluationId-action-plan-measureId.page";

export const Route = createFileRoute(routeKeys.organizationalToolMeasureDetail)(
  { component: OrganizationalMeasureDetailPage }
);
