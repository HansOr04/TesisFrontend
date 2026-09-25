import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Boxes,
  FlaskConical,
  GitCompare,
  Layers,
  Target,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "@/shared/i18n/i18n";
import { useAuth } from "@/modules/auth/application/auth-context";
import { PageTitle } from "@/shared/components/page-title";
import { cn } from "@/shared/lib/utils";
import {
  type AnalyticsTool,
  type SegmentKey,
} from "../../infrastructure/analytics-api";
import { analyticsQueries } from "../../application/analytics-queries";
import { OverviewTab } from "../components/overview-tab";
import { GapsTab } from "../components/gaps-tab";
import { CorrelationsTab } from "../components/correlations-tab";
import { SegmentsTab } from "../components/segments-tab";
import { EffectivenessTab } from "../components/effectiveness-tab";
import { ClustersTab } from "../components/clusters-tab";
import { SimulatorTab } from "../components/simulator-tab";

type Tab =
  | "overview"
  | "gaps"
  | "correlations"
  | "segments"
  | "effectiveness"
  | "clusters"
  | "simulator";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "app.analytics.tabs.overview", icon: BarChart3 },
  { id: "gaps", label: "app.analytics.tabs.gaps", icon: Target },
  {
    id: "correlations",
    label: "app.analytics.tabs.correlations",
    icon: GitCompare,
  },
  { id: "segments", label: "app.analytics.tabs.segments", icon: Layers },
  {
    id: "effectiveness",
    label: "app.analytics.tabs.effectiveness",
    icon: TrendingUp,
  },
  { id: "clusters", label: "app.analytics.tabs.clusters", icon: Boxes },
  {
    id: "simulator",
    label: "app.analytics.tabs.simulator",
    icon: FlaskConical,
  },
];

// Analítica de datos transversal: cada pestaña consume un endpoint del módulo
// assessment-analytics del backend y genera hallazgos en texto a partir de
// los números (los mismos que se citan en la memoria).
export function AnalyticsPage() {
  const auth = useAuth();
  const org = auth.organisations?.current;
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("overview");
  const [tool, setTool] = useState<AnalyticsTool>("ORGANIZATIONAL");
  const [segmentBy, setSegmentBy] = useState<SegmentKey>("country");
  const [k, setK] = useState(3);

  // Cada pestaña consulta solo cuando está activa; React Query cachea los
  // resultados por parámetros, así cambiar de pestaña y volver es inmediato.
  const overviewQuery = useQuery({
    ...analyticsQueries.overview(org),
    enabled: Boolean(org) && tab === "overview",
  });
  const gapsQuery = useQuery({
    ...analyticsQueries.gaps(org, tool),
    enabled: Boolean(org) && tab === "gaps",
  });
  const correlationsQuery = useQuery({
    ...analyticsQueries.correlations(org),
    enabled: Boolean(org) && tab === "correlations",
  });
  const segmentsQuery = useQuery({
    ...analyticsQueries.segments(org, segmentBy),
    enabled: Boolean(org) && tab === "segments",
  });
  const effectivenessQuery = useQuery({
    ...analyticsQueries.effectiveness(org),
    enabled: Boolean(org) && tab === "effectiveness",
  });
  const clustersQuery = useQuery({
    ...analyticsQueries.clusters(org, tool, k),
    enabled: Boolean(org) && tab === "clusters",
  });

  const overview = overviewQuery.data ?? null;
  const gaps = gapsQuery.data ?? null;
  const correlations = correlationsQuery.data ?? null;
  const segments = segmentsQuery.data ?? null;
  const effectiveness = effectivenessQuery.data ?? null;
  const clusters = clustersQuery.data ?? null;
  const active = {
    overview: overviewQuery,
    gaps: gapsQuery,
    correlations: correlationsQuery,
    segments: segmentsQuery,
    effectiveness: effectivenessQuery,
    clusters: clustersQuery,
    simulator: null,
  }[tab];
  const loading = active?.isFetching ?? false;
  const error = active?.error
    ? active.error instanceof Error
      ? active.error.message
      : t("app.analytics.page.loadError")
    : null;

  return (
    <div className="space-y-8">
      <div>
        <PageTitle rawTitle={t("app.analytics.page.title")} />
        <p className="mt-2 max-w-3xl text-base text-muted-foreground">
          {t("app.analytics.page.intro")}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-2xl bg-muted/70 p-1.5">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              tab === item.id
                ? "bg-card text-brand-deep shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {t(item.label)}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-danger/8 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="animate-fade-up" key={tab}>
        {tab === "overview" &&
          (overview ? <OverviewTab data={overview} /> : <Loading />)}
        {tab === "gaps" && (
          <GapsTab
            tool={tool}
            onToolChange={setTool}
            data={gaps}
            loading={loading}
          />
        )}
        {tab === "correlations" &&
          (correlations ? (
            <CorrelationsTab data={correlations} />
          ) : (
            <Loading />
          ))}
        {tab === "segments" && (
          <SegmentsTab
            by={segmentBy}
            onChange={setSegmentBy}
            data={segments}
            loading={loading}
          />
        )}
        {tab === "effectiveness" &&
          (effectiveness ? (
            <EffectivenessTab data={effectiveness} />
          ) : (
            <Loading />
          ))}
        {tab === "clusters" && (
          <ClustersTab
            tool={tool}
            k={k}
            onToolChange={setTool}
            onKChange={setK}
            data={clusters}
            loading={loading}
          />
        )}
        {tab === "simulator" && (
          <SimulatorTab tool={tool} onToolChange={setTool} />
        )}
      </div>
    </div>
  );
}

function Loading() {
  const { t } = useTranslation();
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">
      {t("app.analytics.page.computing")}
    </p>
  );
}
