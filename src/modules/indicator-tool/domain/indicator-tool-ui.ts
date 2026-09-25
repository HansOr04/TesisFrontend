import { routeKeys } from "@/shared/config/route-keys";
import type { IndicatorToolApi } from "../infrastructure/indicator-tool-api";
import type { createToolQueries } from "@/shared/query/tool-queries";

// Todo lo que distingue a la Herramienta Organizativa de la de Capacidades en
// la interfaz: segmento de ruta, prefijo de traducciones, API, queries y
// número de secciones. Las páginas de `presentation/pages` son genéricas y
// reciben esta definición (mismo patrón que EvaluationToolDefinition en el
// backend).
export interface IndicatorToolUi<
  TApi extends IndicatorToolApi = IndicatorToolApi,
> {
  slug: "organizational" | "capacity";
  i18n: "app.assessment.organizational" | "app.assessment.capacity";
  api: TApi;
  queries: ReturnType<
    typeof createToolQueries<
      Awaited<ReturnType<TApi["fetchOrganisationsOverview"]>>,
      Awaited<ReturnType<TApi["fetchEvaluation"]>>,
      Awaited<ReturnType<TApi["fetchMeasures"]>>,
      Awaited<ReturnType<TApi["fetchEvaluationHistory"]>>,
      Awaited<ReturnType<TApi["fetchTemplates"]>>,
      Awaited<ReturnType<TApi["fetchImpactPriority"]>>
    >
  >;
  /** Columnas de sección en el panel general. */
  sectionCount: number;
  routes: {
    list: "/assessments/organizational" | "/assessments/capacity";
    evaluation:
      | "/assessments/organizational/$evaluationId"
      | "/assessments/capacity/$evaluationId";
    summary:
      | "/assessments/organizational/$evaluationId/summary"
      | "/assessments/capacity/$evaluationId/summary";
    actionPlan:
      | "/assessments/organizational/$evaluationId/action-plan"
      | "/assessments/capacity/$evaluationId/action-plan";
    measureDetail:
      | "/assessments/organizational/$evaluationId/action-plan/$measureId"
      | "/assessments/capacity/$evaluationId/action-plan/$measureId";
    section:
      | "/assessments/organizational/$evaluationId/dimension/$number"
      | "/assessments/capacity/$evaluationId/area/$number";
    admin: "/assessments/organizational/admin" | "/assessments/capacity/admin";
  };
  routeKeys: {
    evaluation:
      | routeKeys.organizationalToolEvaluationId
      | routeKeys.capacityToolEvaluationId;
    summary:
      routeKeys.organizationalToolSummary | routeKeys.capacityToolSummary;
    actionPlan:
      routeKeys.organizationalToolActionPlan | routeKeys.capacityToolActionPlan;
    measureDetail:
      | routeKeys.organizationalToolMeasureDetail
      | routeKeys.capacityToolMeasureDetail;
    section:
      | routeKeys.organizationalToolDimensionAnalysis
      | routeKeys.capacityToolAreaAnalysis;
  };
}
