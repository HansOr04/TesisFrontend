import { routeKeys } from "@/shared/config/route-keys";
import type { IndicatorToolUi } from "@/modules/indicator-tool/domain/indicator-tool-ui";
import { capacityQueries } from "../application/capacity-queries";
import { capacityApi } from "../infrastructure/capacity-api";

export const CAPACITY_TOOL_UI: IndicatorToolUi = {
  slug: "capacity",
  i18n: "app.assessment.capacity",
  api: capacityApi,
  queries: capacityQueries,
  sectionCount: 4,
  routes: {
    list: "/assessments/capacity",
    evaluation: "/assessments/capacity/$evaluationId",
    summary: "/assessments/capacity/$evaluationId/summary",
    actionPlan: "/assessments/capacity/$evaluationId/action-plan",
    measureDetail: "/assessments/capacity/$evaluationId/action-plan/$measureId",
    section: "/assessments/capacity/$evaluationId/area/$number",
    admin: "/assessments/capacity/admin",
  },
  routeKeys: {
    evaluation: routeKeys.capacityToolEvaluationId,
    summary: routeKeys.capacityToolSummary,
    actionPlan: routeKeys.capacityToolActionPlan,
    measureDetail: routeKeys.capacityToolMeasureDetail,
    section: routeKeys.capacityToolAreaAnalysis,
  },
};
