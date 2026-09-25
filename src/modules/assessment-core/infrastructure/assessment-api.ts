import {
  genericGet,
  genericPostPutPatch,
  genericFetchForBlob,
  genericSingleFetchWithoutOrganisation,
  downloadBlobResponse,
} from "@/shared/api/http-client";

export type AssessmentProfileType = "ASSOCIATION" | "COMPANY";
export type AssessmentAssociationLevel = "LEVEL_1" | "LEVEL_2";

export interface AssessmentOrganisationProfile {
  id: string;
  organisation: string;
  name: string;
  tradeName?: string;
  type: AssessmentProfileType;
  associationLevel?: AssessmentAssociationLevel;
  country: string;
  region?: string;
  yearStarted?: number;
  memberCount?: number;
  mainActivity?: string;
  mainProduct: string;
  secondaryProducts?: string;
  certifications?: string;
  mainMarkets?: string;
  legalRep?: string;
  contactEmail?: string;
  contactPhone?: string;
  evaluatorId?: string;
  /** Excluye este perfil de la vista cross-organización del Administrador. */
  confidential?: boolean;
  /** Solo aplica si el padre es type="ASSOCIATION" y associationLevel="LEVEL_2". */
  parentProfileId?: string;
  createdAt: string;
}

export interface CreateAssessmentProfileInput {
  name: string;
  tradeName?: string;
  type: AssessmentProfileType;
  associationLevel?: AssessmentAssociationLevel;
  country: string;
  region?: string;
  yearStarted?: number;
  memberCount?: number;
  mainActivity?: string;
  mainProduct: string;
  secondaryProducts?: string;
  certifications?: string;
  mainMarkets?: string;
  legalRep?: string;
  contactEmail?: string;
  contactPhone?: string;
  // `null` limpia explícitamente el evaluador asignado; `undefined` deja el
  // campo sin tocar (ver UpdateAssessmentProfileDto en el server).
  evaluatorId?: string | null;
  confidential?: boolean;
  parentProfileId?: string;
}

export type UpdateAssessmentProfileInput =
  Partial<CreateAssessmentProfileInput>;

export interface AssessmentIndicatorData {
  id: string;
  code: string;
  name: string;
  description?: string;
  /** Qué documento/proceso concreto debe existir para este KPI. */
  helpText?: string;
  /** Nota de calificación específica de este KPI, complementa la rúbrica genérica 1-10. */
  scoringRubric?: string;
  weight: number;
  active: boolean;
  sortOrder: number;
  /** false cuando el evaluador marcó este KPI como "no aplica" para el perfil evaluado. */
  applicable?: boolean;
}

export interface AssessmentSectionData {
  id: string;
  number: number;
  name: string;
  description?: string;
  weight: number;
  sortOrder: number;
  indicators: AssessmentIndicatorData[];
  /** false cuando el evaluador marcó esta sección como "no aplica" para el perfil evaluado. */
  applicable?: boolean;
}

export interface CreateAssessmentSectionInput {
  number: number;
  name: string;
  description?: string;
  weight?: number;
}

export type UpdateAssessmentSectionInput =
  Partial<CreateAssessmentSectionInput>;

export interface CreateAssessmentIndicatorInput {
  code: string;
  name: string;
  description?: string;
  weight?: number;
}

export interface UpdateAssessmentIndicatorInput extends Partial<CreateAssessmentIndicatorInput> {
  active?: boolean;
}

export interface AssessmentProfileApplicability {
  excludedSectionIds: string[];
  excludedIndicatorIds: string[];
}

export async function fetchProfileApplicability(
  org: string,
  profileId: string,
  token?: string
): Promise<AssessmentProfileApplicability> {
  return genericGet<AssessmentProfileApplicability>(
    org,
    `/assessments/profiles/${profileId}/applicability`,
    token
  );
}

export async function setProfileApplicability(
  org: string,
  profileId: string,
  data: AssessmentProfileApplicability,
  token?: string
): Promise<AssessmentProfileApplicability> {
  return genericPostPutPatch<
    AssessmentProfileApplicability,
    AssessmentProfileApplicability
  >(
    org,
    `/assessments/profiles/${profileId}/applicability`,
    "PUT",
    data,
    token
  ) as Promise<AssessmentProfileApplicability>;
}

export interface AssessmentTemplateData {
  id: string;
  organisation: string;
  tool: "ORGANIZATIONAL" | "CAPACITY" | "RISK";
  version: number;
  name: string;
  description?: string;
  active: boolean;
  sections: AssessmentSectionData[];
}

export interface AssessmentResponseData {
  id: string;
  indicatorId: string;
  score: number;
  observation: string;
  isCritical: boolean;
  scoredBy: string;
  scoredAt: string;
  indicator: AssessmentIndicatorData;
}

export interface AssessmentSectionScore {
  sectionId: string;
  number: number;
  name: string;
  weight: number;
  weightedAvg: number;
  critical: boolean;
}

export interface AssessmentEvaluationHistoryEntry {
  evaluationId: string;
  completedAt: string | null;
  globalScore: number;
  sectionScores: AssessmentSectionScore[];
  measuresTotal: number;
  measuresDone: number;
}

export type AssessmentEvaluationStatus =
  "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface AssessmentEvaluationData {
  id: string;
  organisation: string;
  templateId: string;
  profileId: string;
  status: AssessmentEvaluationStatus;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  profile: AssessmentOrganisationProfile;
  template: AssessmentTemplateData;
  responses: AssessmentResponseData[];
  sectionScores: AssessmentSectionScore[];
  globalScore: number;
}

export interface AssessmentEvaluationListItem {
  id: string;
  status: AssessmentEvaluationStatus;
  startedAt: string;
  completedAt?: string;
  profile: AssessmentOrganisationProfile;
  template: { id: string; name: string; version: number };
}

export interface AssessmentCriticalIndicator {
  indicatorId: string;
  code: string;
  name: string;
  score: number;
  observation: string;
}

export interface AssessmentEvaluationSummary {
  evaluationId: string;
  status: AssessmentEvaluationStatus;
  globalScore: number;
  sectionScores: AssessmentSectionScore[];
  criticalIndicators: AssessmentCriticalIndicator[];
}

export interface AssessmentKpiResponseInput {
  indicatorId: string;
  score: number;
  observation: string;
}

// ── Perfiles de organización (RF-02, assessment-core) ───────────────────────────

export async function fetchAssessmentProfiles(
  org: string,
  token?: string
): Promise<AssessmentOrganisationProfile[]> {
  return genericGet<AssessmentOrganisationProfile[]>(
    org,
    "/assessments/profiles",
    token
  );
}

export interface AssessmentAdminProfileRow {
  profile: AssessmentOrganisationProfile;
  organisationName: string;
}

// RF-08: vista cross-organización, solo para el Administrador de plataforma
// (isSuperAdmin). No está scoped a una organización, por eso usa el fetch
// sin prefijo de org (igual que /organisations/user-organisations).
export async function fetchAllAssessmentProfilesForAdmin(
  token?: string
): Promise<AssessmentAdminProfileRow[]> {
  return genericSingleFetchWithoutOrganisation<AssessmentAdminProfileRow[]>(
    "/assessments/admin/all-profiles",
    "",
    token
  );
}

export async function createAssessmentProfile(
  org: string,
  data: CreateAssessmentProfileInput,
  token?: string
): Promise<AssessmentOrganisationProfile> {
  return genericPostPutPatch<
    CreateAssessmentProfileInput,
    AssessmentOrganisationProfile
  >(
    org,
    "/assessments/profiles",
    "POST",
    data,
    token
  ) as Promise<AssessmentOrganisationProfile>;
}

export async function fetchAssessmentProfile(
  org: string,
  id: string,
  token?: string
): Promise<AssessmentOrganisationProfile> {
  return genericGet<AssessmentOrganisationProfile>(
    org,
    `/assessments/profiles/${id}`,
    token
  );
}

export async function updateAssessmentProfile(
  org: string,
  id: string,
  data: UpdateAssessmentProfileInput,
  token?: string
): Promise<AssessmentOrganisationProfile> {
  return genericPostPutPatch<
    UpdateAssessmentProfileInput,
    AssessmentOrganisationProfile
  >(
    org,
    `/assessments/profiles/${id}`,
    "PATCH",
    data,
    token
  ) as Promise<AssessmentOrganisationProfile>;
}

export interface AssessmentProfileChildToolScore {
  evaluationId: string;
  status: AssessmentEvaluationStatus;
  globalScore: number | null;
}

export interface AssessmentProfileToolScores {
  organizational: AssessmentProfileChildToolScore | null;
  capacity: AssessmentProfileChildToolScore | null;
  risk: AssessmentProfileChildToolScore | null;
}

export interface AssessmentProfileChildRow extends AssessmentProfileToolScores {
  profile: AssessmentOrganisationProfile;
}

export interface AssessmentAssociationOverview {
  profile: AssessmentOrganisationProfile;
  ownScores: AssessmentProfileToolScores;
  children: AssessmentProfileChildRow[];
}

export async function fetchAssessmentAssociationOverview(
  org: string,
  id: string,
  token?: string
): Promise<AssessmentAssociationOverview> {
  return genericGet<AssessmentAssociationOverview>(
    org,
    `/assessments/profiles/${id}/children`,
    token
  );
}

// ── Panel consolidado multi-herramienta (RF-07) ───────────────────────────

export type AssessmentDashboardTool = "ORGANIZATIONAL" | "CAPACITY" | "RISK";

export interface AssessmentDashboardFilters {
  tool?: AssessmentDashboardTool;
  status?: AssessmentEvaluationStatus;
  country?: string;
  region?: string;
  from?: string;
  to?: string;
}

export interface AssessmentDashboardToolSummary {
  evaluationId: string;
  status: AssessmentEvaluationStatus;
  globalScore: number | null;
  startedAt: string;
  criticalAlertCount: number;
}

export interface AssessmentDashboardRow {
  profile: {
    id: string;
    name: string;
    country: string;
    region: string | null;
    mainProduct: string;
  };
  organizational: AssessmentDashboardToolSummary | null;
  capacity: AssessmentDashboardToolSummary | null;
  risk: AssessmentDashboardToolSummary | null;
  criticalAlertCount: number;
}

function dashboardQueryString(filters: AssessmentDashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.tool) params.set("tool", filters.tool);
  if (filters.status) params.set("status", filters.status);
  if (filters.country) params.set("country", filters.country);
  if (filters.region) params.set("region", filters.region);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchAssessmentDashboard(
  org: string,
  filters: AssessmentDashboardFilters,
  token?: string
): Promise<AssessmentDashboardRow[]> {
  return genericGet<AssessmentDashboardRow[]>(
    org,
    `/assessments/dashboard${dashboardQueryString(filters)}`,
    token
  );
}

export async function exportAssessmentDashboard(
  org: string,
  filters: AssessmentDashboardFilters,
  token?: string
): Promise<void> {
  const response = await genericFetchForBlob(
    org,
    `/assessments/dashboard/export${dashboardQueryString(filters)}`,
    "GET",
    undefined,
    token
  );
  await downloadBlobResponse(
    response,
    `panel-consolidado-assessment-${Date.now()}.xlsx`
  );
}

export type AssessmentMeasureStatus = "PENDING" | "IN_PROGRESS" | "DONE";

// ── IA y exportes comunes a las tres herramientas ───────────────────────────

export interface AssessmentInconsistencyFinding {
  description: string;
  indicators: Array<{ indicatorId: string; code: string; name: string }>;
}

export type NarrativeTone = "technical" | "informative" | "formal";

/** Fila del cronograma (Gantt) de medidas; común a las tres herramientas. */
export interface AssessmentGanttItem {
  measureId: string;
  description: string;
  responsible: string;
  start: string;
  end: string;
  progressPct: number;
  status: AssessmentMeasureStatus;
}
