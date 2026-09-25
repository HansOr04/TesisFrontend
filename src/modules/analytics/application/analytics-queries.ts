import { queryOptions } from "@tanstack/react-query";
import {
  fetchAnalyticsClusters,
  fetchAnalyticsCorrelations,
  fetchAnalyticsEffectiveness,
  fetchAnalyticsGaps,
  fetchAnalyticsOverview,
  fetchAnalyticsSegments,
  type AnalyticsTool,
  type SegmentKey,
} from "../infrastructure/analytics-api";

// La analítica es cara de calcular y cambia solo al completar evaluaciones:
// se cachea 5 minutos por pestaña/parámetros.
const STALE = 5 * 60 * 1000;
const key = (org: string | undefined, ...rest: unknown[]) =>
  ["analytics", org ?? "", ...rest] as const;

export const analyticsQueries = {
  overview: (org: string | undefined) =>
    queryOptions({
      queryKey: key(org, "overview"),
      queryFn: () => fetchAnalyticsOverview(org as string),
      enabled: Boolean(org),
      staleTime: STALE,
    }),
  gaps: (org: string | undefined, tool: AnalyticsTool) =>
    queryOptions({
      queryKey: key(org, "gaps", tool),
      queryFn: () => fetchAnalyticsGaps(org as string, tool),
      enabled: Boolean(org),
      staleTime: STALE,
    }),
  correlations: (org: string | undefined) =>
    queryOptions({
      queryKey: key(org, "correlations"),
      queryFn: () => fetchAnalyticsCorrelations(org as string),
      enabled: Boolean(org),
      staleTime: STALE,
    }),
  segments: (org: string | undefined, by: SegmentKey) =>
    queryOptions({
      queryKey: key(org, "segments", by),
      queryFn: () => fetchAnalyticsSegments(org as string, by),
      enabled: Boolean(org),
      staleTime: STALE,
    }),
  effectiveness: (org: string | undefined) =>
    queryOptions({
      queryKey: key(org, "effectiveness"),
      queryFn: () => fetchAnalyticsEffectiveness(org as string),
      enabled: Boolean(org),
      staleTime: STALE,
    }),
  clusters: (org: string | undefined, tool: AnalyticsTool, k: number) =>
    queryOptions({
      queryKey: key(org, "clusters", tool, k),
      queryFn: () => fetchAnalyticsClusters(org as string, tool, k),
      enabled: Boolean(org),
      staleTime: STALE,
    }),
};
