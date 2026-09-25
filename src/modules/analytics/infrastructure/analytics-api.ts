import { genericGet } from "@/shared/api/http-client";

export type AnalyticsTool = "ORGANIZATIONAL" | "CAPACITY" | "RISK";
export type CorrelationStrength = "strong" | "moderate" | "weak" | "none";
export type SegmentKey = "country" | "region" | "type" | "mainProduct";

export interface HistogramBin {
  from: number;
  to: number;
  count: number;
}

export interface OverviewSection {
  number: number;
  name: string;
  weight: number;
  avg: number;
  min: number;
  max: number;
  criticalRate: number;
  n: number;
}

export interface OverviewTool {
  tool: AnalyticsTool;
  evaluatedOrganisations: number;
  completedEvaluations: number;
  avgGlobal: number;
  medianGlobal: number;
  stdDevGlobal: number;
  criticalOrganisations: number;
  highOrganisations: number;
  histogram: HistogramBin[];
  sectionAverages: OverviewSection[];
  criticalKpis: number;
  measures: {
    total: number;
    done: number;
    inProgress: number;
    avgProgress: number;
    coverage: number;
  };
}

export interface AnalyticsOverview {
  organisations: number;
  evaluatedOrganisations: number;
  perTool: OverviewTool[];
  trend: ({ month: string } & Record<
    AnalyticsTool,
    { avg: number; count: number } | null
  >)[];
  generatedAt: string;
}

export interface SystemicGap {
  code: string;
  name: string;
  sectionNumber: number;
  sectionName: string;
  weight: number;
  evaluated: number;
  criticalCount: number;
  criticalRate: number;
  avgScore: number;
  withMeasure: number;
  measureCoverage: number;
  priority: number;
  criticalOrganisations: {
    profileId: string;
    profileName: string;
    score: number;
    hasMeasure: boolean;
    measureStatus: "PENDING" | "IN_PROGRESS" | "DONE" | null;
    measureProgress: number | null;
  }[];
}

export interface GapsResponse {
  tool: AnalyticsTool;
  sections: { number: number; name: string; weight: number }[];
  organisations: number;
  gaps: SystemicGap[];
  heatmap: {
    profileId: string;
    profileName: string;
    globalScore: number | null;
    sections: { number: number; score: number | null }[];
  }[];
}

export interface DriverSection {
  number: number;
  name: string;
  weight: number;
  r: number | null;
  strength: CorrelationStrength;
  n: number;
}
export interface CrossToolEntry {
  toolA: AnalyticsTool;
  sectionA: number;
  nameA: string;
  toolB: AnalyticsTool;
  sectionB: number;
  nameB: string;
  r: number | null;
  strength: CorrelationStrength;
  n: number;
}
export interface FactorEntry {
  key: string;
  r: number | null;
  strength: CorrelationStrength;
  n: number;
  regression: { slope: number; intercept: number; r2: number } | null;
  points: { x: number; y: number; profileId: string }[];
}

export interface CorrelationsResponse {
  drivers: { tool: AnalyticsTool; n: number; sections: DriverSection[] }[];
  crossTool: CrossToolEntry[];
  topCrossTool: CrossToolEntry[];
  globalCross: {
    toolA: AnalyticsTool;
    toolB: AnalyticsTool;
    r: number | null;
    strength: CorrelationStrength;
    n: number;
    points: { profileId: string; x: number | null; y: number | null }[];
  }[];
  profileFactors: {
    tool: AnalyticsTool;
    memberCount: FactorEntry;
    age: FactorEntry;
  }[];
  minSample: number;
}

export interface SegmentRow {
  key: string;
  organisations: number;
  tools: Record<
    AnalyticsTool,
    {
      n: number;
      avgGlobal: number;
      stdDev: number;
      criticalKpiAvg: number;
      criticalOrganisations: number;
    }
  >;
}
export interface SegmentsResponse {
  by: SegmentKey;
  segments: SegmentRow[];
}

export interface EffectGroup {
  n: number;
  avgDelta: number;
  improved: number;
  improvedRate: number;
}
export interface EffectivenessTool {
  tool: AnalyticsTool;
  organisationsWithHistory: number;
  avgGlobalDelta: number;
  groups: {
    withDoneMeasure: EffectGroup;
    withOpenMeasure: EffectGroup;
    withoutMeasure: EffectGroup;
    nonCritical: EffectGroup;
  };
  effect: number;
  doneRatioVsDelta: {
    r: number | null;
    strength: CorrelationStrength;
    n: number;
  };
  organisations: {
    profileId: string;
    profileName: string;
    evaluations: number;
    firstScore: number;
    lastScore: number;
    delta: number;
    measuresTotal: number;
    measuresDone: number;
    firstDate: string;
    lastDate: string;
  }[];
}
export interface EffectivenessResponse {
  perTool: EffectivenessTool[];
}

export type ClusterLevel = "HIGH" | "MEDIUM" | "INTERVENTION";

export interface ClusterEntry {
  index: number;
  /** Código estable de la tipología; `label` es su texto en español. */
  level: ClusterLevel;
  label: string;
  size: number;
  avgGlobal: number;
  centroid: { number: number; name: string; value: number }[];
  strongest: { number: number; name: string; value: number } | null;
  weakest: { number: number; name: string; value: number } | null;
  members: {
    profileId: string;
    profileName: string;
    globalScore: number | null;
    country: string;
  }[];
}
export interface ClustersResponse {
  tool: AnalyticsTool;
  k: number;
  iterations: number;
  sections: { number: number; name: string; weight: number }[];
  clusters: ClusterEntry[];
}

export interface BenchmarkResponse {
  profile: { id: string; name: string; country: string; type: string };
  tools: (
    | { tool: AnalyticsTool; evaluated: false }
    | {
        tool: AnalyticsTool;
        evaluated: true;
        globalScore: number;
        cohortAvg: number;
        percentile: number;
        rank: number;
        cohort: number;
        sections: {
          number: number;
          name: string;
          own: number | null;
          cohortAvg: number;
          gap: number | null;
        }[];
      }
  )[];
}

const base = "/assessments/analytics";

export const fetchAnalyticsOverview = (org: string, token?: string) =>
  genericGet<AnalyticsOverview>(org, `${base}/overview`, token);
export const fetchAnalyticsGaps = (
  org: string,
  tool: AnalyticsTool,
  token?: string
) => genericGet<GapsResponse>(org, `${base}/gaps?tool=${tool}`, token);
export const fetchAnalyticsCorrelations = (org: string, token?: string) =>
  genericGet<CorrelationsResponse>(org, `${base}/correlations`, token);
export const fetchAnalyticsSegments = (
  org: string,
  by: SegmentKey,
  token?: string
) => genericGet<SegmentsResponse>(org, `${base}/segments?by=${by}`, token);
export const fetchAnalyticsEffectiveness = (org: string, token?: string) =>
  genericGet<EffectivenessResponse>(org, `${base}/effectiveness`, token);
export const fetchAnalyticsClusters = (
  org: string,
  tool: AnalyticsTool,
  k: number,
  token?: string
) =>
  genericGet<ClustersResponse>(
    org,
    `${base}/clusters?tool=${tool}&k=${k}`,
    token
  );
export const fetchAnalyticsBenchmark = (
  org: string,
  profileId: string,
  token?: string
) =>
  genericGet<BenchmarkResponse>(org, `${base}/benchmark/${profileId}`, token);
