import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { RiskEvaluationDetailPage } from "@/modules/risk-tool/presentation/pages/risk-evaluationId-list.page";

export const Route = createFileRoute(routeKeys.riskToolEvaluationId)({
  component: RiskEvaluationDetailPage,
});
