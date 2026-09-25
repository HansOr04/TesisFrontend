import { routeKeys } from "@/shared/config/route-keys";
import type { IndicatorToolApi } from "../infrastructure/indicator-tool-api";
import type { createToolQueries } from "@/shared/query/tool-queries";

// Todo lo que distingue a una herramienta concreta (por ahora, solo la
// Organizativa) en la interfaz: segmento de ruta, prefijo de traducciones,
// API, queries y número de secciones. Las páginas de `presentation/pages`
// son genéricas y reciben esta definición (mismo patrón que
// EvaluationToolDefinition en el backend).
export interface IndicatorToolUi<
  TApi extends IndicatorToolApi = IndicatorToolApi,
> {
  slug: "organizational";
  i18n: "app.assessment.organizational";
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
    list: "/assessments/organizational";
    evaluation: "/assessments/organizational/$evaluationId";
    summary: "/assessments/organizational/$evaluationId/summary";
    actionPlan: "/assessments/organizational/$evaluationId/action-plan";
    measureDetail: "/assessments/organizational/$evaluationId/action-plan/$measureId";
    section: "/assessments/organizational/$evaluationId/dimension/$number";
    admin: "/assessments/organizational/admin";
  };
  routeKeys: {
    evaluation: routeKeys.organizationalToolEvaluationId;
    summary: routeKeys.organizationalToolSummary;
    actionPlan: routeKeys.organizationalToolActionPlan;
    measureDetail: routeKeys.organizationalToolMeasureDetail;
    section: routeKeys.organizationalToolDimensionAnalysis;
  };
}
