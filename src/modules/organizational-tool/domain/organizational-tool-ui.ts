import { routeKeys } from "@/shared/config/route-keys";
import type { IndicatorToolUi } from "@/modules/indicator-tool/domain/indicator-tool-ui";
import { organizationalQueries } from "../application/organizational-queries";
import { organizationalApi } from "../infrastructure/organizational-api";

export const ORGANIZATIONAL_TOOL_UI: IndicatorToolUi = {
  slug: "organizational",
  i18n: "app.assessment.organizational",
  api: organizationalApi,
  queries: organizationalQueries,
  sectionCount: 6,
  routes: {
    list: "/assessments/organizational",
    evaluation: "/assessments/organizational/$evaluationId",
    summary: "/assessments/organizational/$evaluationId/summary",
    actionPlan: "/assessments/organizational/$evaluationId/action-plan",
    measureDetail:
      "/assessments/organizational/$evaluationId/action-plan/$measureId",
    section: "/assessments/organizational/$evaluationId/dimension/$number",
    admin: "/assessments/organizational/admin",
  },
  routeKeys: {
    evaluation: routeKeys.organizationalToolEvaluationId,
    summary: routeKeys.organizationalToolSummary,
    actionPlan: routeKeys.organizationalToolActionPlan,
    measureDetail: routeKeys.organizationalToolMeasureDetail,
    section: routeKeys.organizationalToolDimensionAnalysis,
  },
};
