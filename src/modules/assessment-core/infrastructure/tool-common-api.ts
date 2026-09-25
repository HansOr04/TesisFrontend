import {
  downloadBlobResponse,
  genericFetchForBlob,
  genericPostPutPatch,
} from "@/shared/api/http-client";
import type {
  AssessmentInconsistencyFinding,
  NarrativeTone,
} from "./assessment-api";

// Capacidades que las tres herramientas exponen con la misma forma: se
// construyen por segmento de ruta ("organizational" | "capacity" | "risk").

export const detectInconsistenciesFor =
  (tool: string) =>
  (
    org: string,
    evaluationId: string,
    token?: string
  ): Promise<{ findings: AssessmentInconsistencyFinding[] }> =>
    genericPostPutPatch<
      Record<string, never>,
      { findings: AssessmentInconsistencyFinding[] }
    >(
      org,
      `/assessments/${tool}/evaluations/${evaluationId}/detect-inconsistencies`,
      "POST",
      {},
      token
    );

export const generateExecutiveNarrativeFor =
  (tool: string) =>
  (
    org: string,
    evaluationId: string,
    tone: NarrativeTone,
    token?: string
  ): Promise<{ narrative: string }> =>
    genericPostPutPatch<{ tone: NarrativeTone }, { narrative: string }>(
      org,
      `/assessments/${tool}/evaluations/${evaluationId}/executive-narrative`,
      "POST",
      { tone },
      token
    );

export const exportSummaryFor =
  (tool: string, path: string, filePrefix: string) =>
  async (org: string, evaluationId: string, token?: string): Promise<void> => {
    const response = await genericFetchForBlob(
      org,
      `/assessments/${tool}/evaluations/${evaluationId}/${path}`,
      "GET",
      undefined,
      token
    );
    await downloadBlobResponse(response, `${filePrefix}-${evaluationId}.xlsx`);
  };

export const exportSummaryPptxFor =
  (tool: string, path: string, filePrefix: string) =>
  async (
    org: string,
    evaluationId: string,
    narrative?: string | null,
    token?: string
  ): Promise<void> => {
    const response = await genericFetchForBlob(
      org,
      `/assessments/${tool}/evaluations/${evaluationId}/${path}`,
      "POST",
      { narrative: narrative ?? undefined },
      token
    );
    await downloadBlobResponse(response, `${filePrefix}-${evaluationId}.pptx`);
  };
