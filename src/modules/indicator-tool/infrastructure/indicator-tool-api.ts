import { genericGet, genericPostPutPatch } from "@/shared/api/http-client";
import {
  detectInconsistenciesFor,
  exportSummaryFor,
  exportSummaryPptxFor,
  generateExecutiveNarrativeFor,
} from "@/modules/assessment-core/infrastructure/tool-common-api";
import type {
  AssessmentMeasureStatus,
  AssessmentEvaluationData,
  AssessmentEvaluationHistoryEntry,
  AssessmentEvaluationListItem,
  AssessmentEvaluationStatus,
  AssessmentEvaluationSummary,
  AssessmentIndicatorData,
  AssessmentKpiResponseInput,
  AssessmentOrganisationProfile,
  AssessmentSectionData,
  AssessmentSectionScore,
  AssessmentTemplateData,
  CreateAssessmentIndicatorInput,
  CreateAssessmentSectionInput,
  UpdateAssessmentIndicatorInput,
  UpdateAssessmentSectionInput,
} from "@/modules/assessment-core/infrastructure/assessment-api";

// API de las herramientas basadas en KPI (Organizativa y de Capacidades): las
// rutas y los contratos son idénticos; solo cambia el segmento de la
// herramienta y el nombre del segmento de sección (dimensions | areas).

export type IndicatorToolSlug = "organizational" | "capacity";

export interface IndicatorToolOrganisationRow {
  profile: AssessmentOrganisationProfile;
  evaluationId: string | null;
  status: AssessmentEvaluationStatus | null;
  globalScore: number | null;
  sectionScores: AssessmentSectionScore[];
  criticalCount: number;
  isConsolidated?: boolean;
}
export interface IndicatorToolOrganisationsOverview {
  totalOrganisations: number;
  activeEvaluations: number;
  totalCritical: number;
  overallCompliancePct: number;
  organisations: IndicatorToolOrganisationRow[];
}
export interface IndicatorToolMeasure {
  id: string;
  evaluationId: string;
  indicatorId: string;
  indicator: AssessmentIndicatorData;
  name: string;
  description?: string;
  responsible: string;
  support?: string;
  startDate: string;
  endDate: string;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
  appliedImprovements?: string;
  progressPct: number;
  status: AssessmentMeasureStatus;
  updatedBy: string;
  createdAt: string;
}
export interface CreateIndicatorToolMeasureInput {
  indicatorId: string;
  name: string;
  description?: string;
  responsible: string;
  support?: string;
  startDate: string;
  endDate: string;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
  appliedImprovements?: string;
}
export interface UpdateIndicatorToolMeasureInput {
  progressPct: number;
  support?: string;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
  appliedImprovements?: string;
}
export interface IndicatorToolMeasureSuggestion {
  indicatorId: string;
  name: string;
  description: string;
}
export interface IndicatorToolEvaluationSuggestion extends IndicatorToolMeasureSuggestion {
  code: string;
  score: number;
  impactScore: number;
  sectionNumber: number;
  sectionName: string;
}
export interface IndicatorToolImpactPriorityItem {
  indicatorId: string;
  code: string;
  name: string;
  score: number;
  weight: number;
  impactScore: number;
  sectionNumber: number;
  sectionName: string;
}

export type {
  AssessmentInconsistencyFinding,
  NarrativeTone,
} from "@/modules/assessment-core/infrastructure/assessment-api";

export function createIndicatorToolApi(
  slug: IndicatorToolSlug,
  sectionSegment: "dimensions" | "areas"
) {
  const base = `/assessments/${slug}`;

  // ── Estructura (plantilla, secciones, KPI) ───────────────────────────────

  async function fetchTemplates(
    org: string,
    token?: string
  ): Promise<AssessmentTemplateData[]> {
    return genericGet<AssessmentTemplateData[]>(
      org,
      `${base}/templates`,
      token
    );
  }

  async function createSection(
    org: string,
    templateId: string,
    data: CreateAssessmentSectionInput,
    token?: string
  ): Promise<AssessmentSectionData> {
    return genericPostPutPatch<
      CreateAssessmentSectionInput,
      AssessmentSectionData
    >(
      org,
      `${base}/templates/${templateId}/sections`,
      "POST",
      data,
      token
    ) as Promise<AssessmentSectionData>;
  }

  async function updateSection(
    org: string,
    sectionId: string,
    data: UpdateAssessmentSectionInput,
    confirm: boolean,
    token?: string
  ): Promise<AssessmentSectionData> {
    return genericPostPutPatch<
      UpdateAssessmentSectionInput,
      AssessmentSectionData
    >(
      org,
      `${base}/sections/${sectionId}${confirm ? "?confirm=true" : ""}`,
      "PATCH",
      data,
      token
    ) as Promise<AssessmentSectionData>;
  }

  async function deleteSection(
    org: string,
    sectionId: string,
    confirm: boolean,
    token?: string
  ): Promise<{ success: boolean }> {
    return genericPostPutPatch<Record<string, never>, { success: boolean }>(
      org,
      `${base}/sections/${sectionId}${confirm ? "?confirm=true" : ""}`,
      "DELETE",
      {},
      token
    ) as Promise<{ success: boolean }>;
  }

  async function createIndicator(
    org: string,
    sectionId: string,
    data: CreateAssessmentIndicatorInput,
    token?: string
  ): Promise<AssessmentIndicatorData> {
    return genericPostPutPatch<
      CreateAssessmentIndicatorInput,
      AssessmentIndicatorData
    >(
      org,
      `${base}/sections/${sectionId}/indicators`,
      "POST",
      data,
      token
    ) as Promise<AssessmentIndicatorData>;
  }

  async function updateIndicator(
    org: string,
    indicatorId: string,
    data: UpdateAssessmentIndicatorInput,
    confirm: boolean,
    token?: string
  ): Promise<AssessmentIndicatorData> {
    return genericPostPutPatch<
      UpdateAssessmentIndicatorInput,
      AssessmentIndicatorData
    >(
      org,
      `${base}/indicators/${indicatorId}${confirm ? "?confirm=true" : ""}`,
      "PATCH",
      data,
      token
    ) as Promise<AssessmentIndicatorData>;
  }

  async function deleteIndicator(
    org: string,
    indicatorId: string,
    confirm: boolean,
    token?: string
  ): Promise<{ success: boolean }> {
    return genericPostPutPatch<Record<string, never>, { success: boolean }>(
      org,
      `${base}/indicators/${indicatorId}${confirm ? "?confirm=true" : ""}`,
      "DELETE",
      {},
      token
    ) as Promise<{ success: boolean }>;
  }

  async function fetchEvaluations(
    org: string,
    token?: string
  ): Promise<AssessmentEvaluationListItem[]> {
    return genericGet<AssessmentEvaluationListItem[]>(
      org,
      `${base}/evaluations`,
      token
    );
  }

  async function fetchEvaluation(
    org: string,
    id: string,
    token?: string
  ): Promise<AssessmentEvaluationData> {
    return genericGet<AssessmentEvaluationData>(
      org,
      `${base}/evaluations/${id}`,
      token
    );
  }

  async function fetchEvaluationHistory(
    org: string,
    profileId: string,
    token?: string
  ): Promise<AssessmentEvaluationHistoryEntry[]> {
    return genericGet<AssessmentEvaluationHistoryEntry[]>(
      org,
      `${base}/profiles/${profileId}/evaluation-history`,
      token
    );
  }

  async function createEvaluation(
    org: string,
    data: { profileId: string },
    token?: string
  ): Promise<AssessmentEvaluationData> {
    return genericPostPutPatch<typeof data, AssessmentEvaluationData>(
      org,
      `${base}/evaluations`,
      "POST",
      data,
      token
    ) as Promise<AssessmentEvaluationData>;
  }

  async function upsertResponses(
    org: string,
    evaluationId: string,
    responses: AssessmentKpiResponseInput[],
    token?: string
  ): Promise<AssessmentEvaluationData> {
    return genericPostPutPatch<
      { responses: AssessmentKpiResponseInput[] },
      AssessmentEvaluationData
    >(
      org,
      `${base}/evaluations/${evaluationId}/responses`,
      "PUT",
      { responses },
      token
    ) as Promise<AssessmentEvaluationData>;
  }

  async function completeEvaluation(
    org: string,
    evaluationId: string,
    token?: string
  ): Promise<AssessmentEvaluationData> {
    return genericPostPutPatch<Record<string, never>, AssessmentEvaluationData>(
      org,
      `${base}/evaluations/${evaluationId}/complete`,
      "POST",
      {},
      token
    ) as Promise<AssessmentEvaluationData>;
  }

  async function fetchSummary(
    org: string,
    evaluationId: string,
    token?: string
  ): Promise<AssessmentEvaluationSummary> {
    return genericGet<AssessmentEvaluationSummary>(
      org,
      `${base}/evaluations/${evaluationId}/summary`,
      token
    );
  }

  // ── Panel general (panel general) ──────────────────────────────────

  async function fetchOrganisationsOverview(
    org: string,
    token?: string
  ): Promise<IndicatorToolOrganisationsOverview> {
    return genericGet<IndicatorToolOrganisationsOverview>(
      org,
      `${base}/organisations-overview`,
      token
    );
  }

  // ── Plan de mitigación simplificado ───────────────────────────────────────

  async function fetchMeasures(
    org: string,
    evaluationId: string,
    token?: string
  ): Promise<IndicatorToolMeasure[]> {
    return genericGet<IndicatorToolMeasure[]>(
      org,
      `${base}/evaluations/${evaluationId}/measures`,
      token
    );
  }

  async function createMeasure(
    org: string,
    evaluationId: string,
    data: CreateIndicatorToolMeasureInput,
    token?: string
  ): Promise<IndicatorToolMeasure> {
    return genericPostPutPatch<
      CreateIndicatorToolMeasureInput,
      IndicatorToolMeasure
    >(
      org,
      `${base}/evaluations/${evaluationId}/measures`,
      "POST",
      data,
      token
    ) as Promise<IndicatorToolMeasure>;
  }

  async function updateMeasureProgress(
    org: string,
    measureId: string,
    data: UpdateIndicatorToolMeasureInput,
    token?: string
  ): Promise<IndicatorToolMeasure> {
    return genericPostPutPatch<
      UpdateIndicatorToolMeasureInput,
      IndicatorToolMeasure
    >(
      org,
      `${base}/measures/${measureId}`,
      "PATCH",
      data,
      token
    ) as Promise<IndicatorToolMeasure>;
  }

  // ── Asistencia con IA ──────────────────────────────────────────────────────

  async function improveObservation(
    org: string,
    evaluationId: string,
    indicatorId: string,
    score: number,
    observation: string,
    token?: string
  ): Promise<{ improved: string }> {
    return genericPostPutPatch<
      { score: number; observation: string },
      { improved: string }
    >(
      org,
      `${base}/evaluations/${evaluationId}/responses/${indicatorId}/improve-observation`,
      "POST",
      { score, observation },
      token
    ) as Promise<{ improved: string }>;
  }

  async function suggestMeasuresForSection(
    org: string,
    evaluationId: string,
    sectionNumber: number,
    token?: string
  ): Promise<{ suggestions: IndicatorToolMeasureSuggestion[] }> {
    return genericPostPutPatch<
      Record<string, never>,
      { suggestions: IndicatorToolMeasureSuggestion[] }
    >(
      org,
      `${base}/evaluations/${evaluationId}/${sectionSegment}/${sectionNumber}/suggest-measures`,
      "POST",
      {},
      token
    ) as Promise<{ suggestions: IndicatorToolMeasureSuggestion[] }>;
  }

  async function suggestMeasuresForEvaluation(
    org: string,
    evaluationId: string,
    token?: string
  ): Promise<{ suggestions: IndicatorToolEvaluationSuggestion[] }> {
    return genericPostPutPatch<
      Record<string, never>,
      { suggestions: IndicatorToolEvaluationSuggestion[] }
    >(
      org,
      `${base}/evaluations/${evaluationId}/suggest-measures`,
      "POST",
      {},
      token
    ) as Promise<{ suggestions: IndicatorToolEvaluationSuggestion[] }>;
  }

  async function fetchImpactPriority(
    org: string,
    evaluationId: string,
    token?: string
  ): Promise<{ items: IndicatorToolImpactPriorityItem[] }> {
    return genericGet<{ items: IndicatorToolImpactPriorityItem[] }>(
      org,
      `${base}/evaluations/${evaluationId}/impact-priority`,
      token
    );
  }

  return {
    fetchTemplates,
    createSection,
    updateSection,
    deleteSection,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    fetchEvaluations,
    fetchEvaluation,
    fetchEvaluationHistory,
    createEvaluation,
    upsertResponses,
    completeEvaluation,
    fetchSummary,
    fetchOrganisationsOverview,
    fetchMeasures,
    createMeasure,
    updateMeasureProgress,
    improveObservation,
    suggestMeasuresForSection,
    suggestMeasuresForEvaluation,
    fetchImpactPriority,
    detectInconsistencies: detectInconsistenciesFor(slug),
    generateExecutiveNarrative: generateExecutiveNarrativeFor(slug),
    exportSummary: exportSummaryFor(slug, "summary/export", `resumen-${slug}`),
    exportSummaryPptx: exportSummaryPptxFor(
      slug,
      "summary/export-pptx",
      `reporte-${slug}`
    ),
  };
}

export type IndicatorToolApi = ReturnType<typeof createIndicatorToolApi>;
