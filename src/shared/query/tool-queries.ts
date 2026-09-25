import { queryOptions, type QueryClient } from "@tanstack/react-query";

// Fábrica de queries de React Query para una herramienta de evaluación. Las
// tres herramientas exponen la misma API de lectura, así que las claves y las
// opciones (staleTime, enabled) se definen una sola vez. Las mutaciones de
// cada página invalidan por clave: `invalidateEvaluation(queryClient, org, id)`.

export interface ToolReadApi<
  TOverview,
  TEvaluation,
  TMeasures,
  THistory,
  TTemplates,
  TImpact,
> {
  fetchOrganisationsOverview: (
    org: string,
    token?: string
  ) => Promise<TOverview>;
  fetchEvaluation: (
    org: string,
    evaluationId: string,
    token?: string
  ) => Promise<TEvaluation>;
  fetchMeasures: (
    org: string,
    evaluationId: string,
    token?: string
  ) => Promise<TMeasures>;
  fetchEvaluationHistory: (
    org: string,
    profileId: string,
    token?: string
  ) => Promise<THistory>;
  fetchTemplates: (org: string, token?: string) => Promise<TTemplates>;
  fetchImpactPriority: (
    org: string,
    evaluationId: string,
    token?: string
  ) => Promise<TImpact>;
}

const STALE_SHORT = 30 * 1000; // datos que cambian al evaluar
const STALE_LONG = 5 * 60 * 1000; // plantillas

export function createToolQueries<
  TOverview,
  TEvaluation,
  TMeasures,
  THistory,
  TTemplates,
  TImpact,
>(
  tool: string,
  api: ToolReadApi<
    TOverview,
    TEvaluation,
    TMeasures,
    THistory,
    TTemplates,
    TImpact
  >
) {
  const keys = {
    all: (org: string) => [tool, org] as const,
    overview: (org: string) => [tool, org, "overview"] as const,
    templates: (org: string) => [tool, org, "templates"] as const,
    evaluation: (org: string, id: string) =>
      [tool, org, "evaluation", id] as const,
    measures: (org: string, id: string) =>
      [tool, org, "evaluation", id, "measures"] as const,
    impact: (org: string, id: string) =>
      [tool, org, "evaluation", id, "impact-priority"] as const,
    history: (org: string, profileId: string) =>
      [tool, org, "history", profileId] as const,
  };

  return {
    keys,
    overview: (org: string | undefined) =>
      queryOptions({
        queryKey: keys.overview(org ?? ""),
        queryFn: () => api.fetchOrganisationsOverview(org as string),
        enabled: Boolean(org),
        staleTime: STALE_SHORT,
      }),
    templates: (org: string | undefined) =>
      queryOptions({
        queryKey: keys.templates(org ?? ""),
        queryFn: () => api.fetchTemplates(org as string),
        enabled: Boolean(org),
        staleTime: STALE_LONG,
      }),
    evaluation: (org: string | undefined, id: string) =>
      queryOptions({
        queryKey: keys.evaluation(org ?? "", id),
        queryFn: () => api.fetchEvaluation(org as string, id),
        enabled: Boolean(org && id),
        staleTime: STALE_SHORT,
      }),
    measures: (org: string | undefined, id: string) =>
      queryOptions({
        queryKey: keys.measures(org ?? "", id),
        queryFn: () => api.fetchMeasures(org as string, id),
        enabled: Boolean(org && id),
        staleTime: STALE_SHORT,
      }),
    impactPriority: (org: string | undefined, id: string) =>
      queryOptions({
        queryKey: keys.impact(org ?? "", id),
        queryFn: () => api.fetchImpactPriority(org as string, id),
        enabled: Boolean(org && id),
        staleTime: STALE_SHORT,
      }),
    history: (org: string | undefined, profileId: string | undefined) =>
      queryOptions({
        queryKey: keys.history(org ?? "", profileId ?? ""),
        queryFn: () =>
          api.fetchEvaluationHistory(org as string, profileId as string),
        enabled: Boolean(org && profileId),
        staleTime: STALE_SHORT,
      }),

    /** Tras puntuar, completar o planificar: refresca todo lo de la evaluación. */
    invalidateEvaluation(queryClient: QueryClient, org: string, id: string) {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.evaluation(org, id) }),
        queryClient.invalidateQueries({ queryKey: keys.overview(org) }),
        queryClient.invalidateQueries({
          queryKey: [tool, org, "history"],
        }),
      ]);
    },
    /** Tras crear una evaluación o editar la estructura. */
    invalidateAll(queryClient: QueryClient, org: string) {
      return queryClient.invalidateQueries({ queryKey: keys.all(org) });
    },
  };
}
