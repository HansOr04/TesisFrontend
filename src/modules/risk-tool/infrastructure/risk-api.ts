import { genericGet, genericPostPutPatch } from "@/shared/api/http-client";
import type {
  AssessmentMeasureStatus,
  AssessmentEvaluationData,
  AssessmentEvaluationHistoryEntry,
  AssessmentEvaluationListItem,
  AssessmentEvaluationStatus,
  AssessmentEvaluationSummary,
  AssessmentIndicatorData,
  AssessmentOrganisationProfile,
  AssessmentSectionData,
  AssessmentSectionScore,
  AssessmentTemplateData,
  CreateAssessmentIndicatorInput,
  CreateAssessmentSectionInput,
  UpdateAssessmentIndicatorInput,
  UpdateAssessmentSectionInput,
} from "@/modules/assessment-core/infrastructure/assessment-api";

// ── Herramienta de Riesgos (RF-05/RF-06) ────────────────────────────────────────

export async function fetchRiskTemplates(
  org: string,
  token?: string
): Promise<AssessmentTemplateData[]> {
  return genericGet<AssessmentTemplateData[]>(
    org,
    "/assessments/risk/templates",
    token
  );
}

export async function createRiskSection(
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
    `/assessments/risk/templates/${templateId}/sections`,
    "POST",
    data,
    token
  ) as Promise<AssessmentSectionData>;
}

export async function updateRiskSection(
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
    `/assessments/risk/sections/${sectionId}${confirm ? "?confirm=true" : ""}`,
    "PATCH",
    data,
    token
  ) as Promise<AssessmentSectionData>;
}

export async function deleteRiskSection(
  org: string,
  sectionId: string,
  confirm: boolean,
  token?: string
): Promise<{ success: boolean }> {
  return genericPostPutPatch<Record<string, never>, { success: boolean }>(
    org,
    `/assessments/risk/sections/${sectionId}${confirm ? "?confirm=true" : ""}`,
    "DELETE",
    {},
    token
  ) as Promise<{ success: boolean }>;
}

export async function createRiskIndicator(
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
    `/assessments/risk/sections/${sectionId}/indicators`,
    "POST",
    data,
    token
  ) as Promise<AssessmentIndicatorData>;
}

export async function updateRiskIndicator(
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
    `/assessments/risk/indicators/${indicatorId}${confirm ? "?confirm=true" : ""}`,
    "PATCH",
    data,
    token
  ) as Promise<AssessmentIndicatorData>;
}

export async function deleteRiskIndicator(
  org: string,
  indicatorId: string,
  confirm: boolean,
  token?: string
): Promise<{ success: boolean }> {
  return genericPostPutPatch<Record<string, never>, { success: boolean }>(
    org,
    `/assessments/risk/indicators/${indicatorId}${confirm ? "?confirm=true" : ""}`,
    "DELETE",
    {},
    token
  ) as Promise<{ success: boolean }>;
}

export async function fetchRiskEvaluations(
  org: string,
  token?: string
): Promise<AssessmentEvaluationListItem[]> {
  return genericGet<AssessmentEvaluationListItem[]>(
    org,
    "/assessments/risk/evaluations",
    token
  );
}

export async function fetchRiskEvaluation(
  org: string,
  id: string,
  token?: string
): Promise<AssessmentEvaluationData> {
  return genericGet<AssessmentEvaluationData>(
    org,
    `/assessments/risk/evaluations/${id}`,
    token
  );
}

export async function fetchRiskEvaluationHistory(
  org: string,
  profileId: string,
  token?: string
): Promise<AssessmentEvaluationHistoryEntry[]> {
  return genericGet<AssessmentEvaluationHistoryEntry[]>(
    org,
    `/assessments/risk/profiles/${profileId}/evaluation-history`,
    token
  );
}

export async function createRiskEvaluation(
  org: string,
  data: { profileId: string },
  token?: string
): Promise<AssessmentEvaluationData> {
  return genericPostPutPatch<typeof data, AssessmentEvaluationData>(
    org,
    "/assessments/risk/evaluations",
    "POST",
    data,
    token
  ) as Promise<AssessmentEvaluationData>;
}

export interface AssessmentKpiResponseRiskInput {
  indicatorId: string;
  score: number;
  observation: string;
  riskDescription: string;
  riskType?: string;
}

export async function upsertRiskResponses(
  org: string,
  evaluationId: string,
  responses: AssessmentKpiResponseRiskInput[],
  token?: string
): Promise<AssessmentEvaluationData> {
  return genericPostPutPatch<
    { responses: AssessmentKpiResponseRiskInput[] },
    AssessmentEvaluationData
  >(
    org,
    `/assessments/risk/evaluations/${evaluationId}/responses`,
    "PUT",
    { responses },
    token
  ) as Promise<AssessmentEvaluationData>;
}

export async function completeRiskEvaluation(
  org: string,
  evaluationId: string,
  token?: string
): Promise<AssessmentEvaluationData> {
  return genericPostPutPatch<Record<string, never>, AssessmentEvaluationData>(
    org,
    `/assessments/risk/evaluations/${evaluationId}/complete`,
    "POST",
    {},
    token
  ) as Promise<AssessmentEvaluationData>;
}

export async function fetchRiskSummary(
  org: string,
  evaluationId: string,
  token?: string
): Promise<AssessmentEvaluationSummary> {
  return genericGet<AssessmentEvaluationSummary>(
    org,
    `/assessments/risk/evaluations/${evaluationId}/summary`,
    token
  );
}

// ── Panel general (panel general) ─────────────────────────────────

export interface RiskToolOrganisationRow {
  profile: AssessmentOrganisationProfile;
  evaluationId: string | null;
  status: AssessmentEvaluationStatus | null;
  globalScore: number | null;
  sectionScores: AssessmentSectionScore[];
  criticalCount: number;
  isConsolidated?: boolean;
}

export interface RiskToolOrganisationsOverview {
  totalOrganisations: number;
  activeEvaluations: number;
  totalCritical: number;
  overallCompliancePct: number;
  organisations: RiskToolOrganisationRow[];
}

export async function fetchRiskOrganisationsOverview(
  org: string,
  token?: string
): Promise<RiskToolOrganisationsOverview> {
  return genericGet<RiskToolOrganisationsOverview>(
    org,
    "/assessments/risk/organisations-overview",
    token
  );
}

// ── Riesgos y plan de mitigación (RF-05/RF-06) ────────────────────────────

export type AssessmentRiskClass = "NEGLIGIBLE" | "NON_NEGLIGIBLE";

export interface AssessmentMitigationMeasureData {
  id: string;
  riskId: string;
  description: string;
  responsible: string;
  support?: string;
  startWeek: string;
  durationDays: number;
  endDate: string;
  resources?: string;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
  appliedImprovements?: string;
  progressPct: number;
  status: AssessmentMeasureStatus;
  updatedBy: string;
  createdAt: string;
}

export interface AssessmentRiskData {
  id: string;
  evaluationId: string;
  indicatorId: string;
  description: string;
  riskType?: string;
  class: AssessmentRiskClass;
  identifiedBy: string;
  measures: AssessmentMitigationMeasureData[];
}

export async function fetchRiskRisks(
  org: string,
  evaluationId: string,
  token?: string
): Promise<AssessmentRiskData[]> {
  return genericGet<AssessmentRiskData[]>(
    org,
    `/assessments/risk/evaluations/${evaluationId}/risks`,
    token
  );
}

export interface CreateAssessmentRiskMeasureInput {
  description: string;
  responsible: string;
  support?: string;
  startWeek: string;
  durationDays: number;
  resources?: string;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
  appliedImprovements?: string;
}

export interface UpdateAssessmentMitigationMeasureInput {
  progressPct: number;
  support?: string;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
  appliedImprovements?: string;
}

export async function createRiskMeasure(
  org: string,
  riskId: string,
  data: CreateAssessmentRiskMeasureInput,
  token?: string
): Promise<AssessmentMitigationMeasureData> {
  return genericPostPutPatch<
    CreateAssessmentRiskMeasureInput,
    AssessmentMitigationMeasureData
  >(
    org,
    `/assessments/risk/risks/${riskId}/measures`,
    "POST",
    data,
    token
  ) as Promise<AssessmentMitigationMeasureData>;
}

export async function updateRiskMeasureProgress(
  org: string,
  measureId: string,
  data: UpdateAssessmentMitigationMeasureInput,
  token?: string
): Promise<AssessmentMitigationMeasureData> {
  return genericPostPutPatch<
    UpdateAssessmentMitigationMeasureInput,
    AssessmentMitigationMeasureData
  >(
    org,
    `/assessments/risk/measures/${measureId}`,
    "PATCH",
    data,
    token
  ) as Promise<AssessmentMitigationMeasureData>;
}

export type { AssessmentGanttItem } from "@/modules/assessment-core/infrastructure/assessment-api";
import type { AssessmentGanttItem } from "@/modules/assessment-core/infrastructure/assessment-api";

export async function fetchRiskGantt(
  org: string,
  evaluationId: string,
  token?: string
): Promise<AssessmentGanttItem[]> {
  return genericGet<AssessmentGanttItem[]>(
    org,
    `/assessments/risk/evaluations/${evaluationId}/gantt`,
    token
  );
}

// ── Asistencia con IA (Risk) ──────────────────────────────────────────────

export async function improveRiskObservation(
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
    `/assessments/risk/evaluations/${evaluationId}/responses/${indicatorId}/improve-observation`,
    "POST",
    { score, observation },
    token
  ) as Promise<{ improved: string }>;
}

export interface RiskToolMeasureSuggestion {
  riskId: string;
  indicatorId: string;
  description: string;
}

export async function suggestRiskMeasuresForPrinciple(
  org: string,
  evaluationId: string,
  principleNumber: number,
  token?: string
): Promise<{ suggestions: RiskToolMeasureSuggestion[] }> {
  return genericPostPutPatch<
    Record<string, never>,
    { suggestions: RiskToolMeasureSuggestion[] }
  >(
    org,
    `/assessments/risk/evaluations/${evaluationId}/principles/${principleNumber}/suggest-measures`,
    "POST",
    {},
    token
  ) as Promise<{ suggestions: RiskToolMeasureSuggestion[] }>;
}

export interface RiskToolEvaluationSuggestion extends RiskToolMeasureSuggestion {
  code: string;
  score: number;
  impactScore: number;
  sectionNumber: number;
  sectionName: string;
}

export async function suggestRiskMeasuresForEvaluation(
  org: string,
  evaluationId: string,
  token?: string
): Promise<{ suggestions: RiskToolEvaluationSuggestion[] }> {
  return genericPostPutPatch<
    Record<string, never>,
    { suggestions: RiskToolEvaluationSuggestion[] }
  >(
    org,
    `/assessments/risk/evaluations/${evaluationId}/suggest-measures`,
    "POST",
    {},
    token
  ) as Promise<{ suggestions: RiskToolEvaluationSuggestion[] }>;
}

export interface RiskToolImpactPriorityItem {
  riskId: string;
  indicatorId: string;
  code: string;
  name: string;
  score: number;
  weight: number;
  threshold: number;
  impactScore: number;
  sectionNumber: number;
  sectionName: string;
}

export async function fetchRiskImpactPriority(
  org: string,
  evaluationId: string,
  token?: string
): Promise<{ items: RiskToolImpactPriorityItem[] }> {
  return genericGet<{ items: RiskToolImpactPriorityItem[] }>(
    org,
    `/assessments/risk/evaluations/${evaluationId}/impact-priority`,
    token
  );
}

// ── Detección de inconsistencias + narrativa ejecutiva + exportación ───────

export type {
  AssessmentInconsistencyFinding,
  NarrativeTone,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import {
  detectInconsistenciesFor,
  exportSummaryFor,
  exportSummaryPptxFor,
  generateExecutiveNarrativeFor,
} from "@/modules/assessment-core/infrastructure/tool-common-api";

export const detectRiskInconsistencies = detectInconsistenciesFor("risk");
export const generateRiskExecutiveNarrative =
  generateExecutiveNarrativeFor("risk");
export const exportRiskMitigationPlan = exportSummaryFor(
  "risk",
  "mitigation-plan/export",
  "plan-mitigacion-risk"
);
export const exportRiskMitigationPlanPptx = exportSummaryPptxFor(
  "risk",
  "mitigation-plan/export-pptx",
  "reporte-risk"
);

// ── Parámetros de riesgo por país (administración) ─────────────────────────

export interface RiskCountryParam {
  country: string;
  riskThreshold: number;
  updatedAt: string;
}

export async function fetchRiskCountryParams(
  org: string,
  token?: string
): Promise<RiskCountryParam[]> {
  return genericGet<RiskCountryParam[]>(
    org,
    "/assessments/risk/country-params",
    token
  );
}

export async function upsertRiskCountryParam(
  org: string,
  input: { country: string; riskThreshold: number },
  token?: string
): Promise<RiskCountryParam> {
  return genericPostPutPatch<typeof input, RiskCountryParam>(
    org,
    "/assessments/risk/country-params",
    "PUT",
    input,
    token
  );
}

export async function deleteRiskCountryParam(
  org: string,
  country: string,
  token?: string
): Promise<void> {
  await genericPostPutPatch<null, { success: boolean }>(
    org,
    `/assessments/risk/country-params/${encodeURIComponent(country)}`,
    "DELETE",
    null,
    token
  );
}
