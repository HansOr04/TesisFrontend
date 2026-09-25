import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type {
  AnalyticsTool,
  ClustersResponse,
} from "../../infrastructure/analytics-api";
import { ToolTabs, fmt, useAnalyticsLabels } from "./analytics-ui";
import { useTranslation } from "@/shared/i18n/i18n";
import {
  ChartCard,
  KeyFindings,
  MethodCard,
  Note,
  TabHeader,
} from "./analytics-layout";
import { cn } from "@/shared/lib/utils";

const CLUSTER_COLORS = [
  "#1F9D5B",
  "#F28C0F",
  "#DC3D43",
  "#1D8FBF",
  "#8B5CF6",
  "#0D9488",
];

interface Props {
  tool: AnalyticsTool;
  k: number;
  onToolChange: (t: AnalyticsTool) => void;
  onKChange: (k: number) => void;
  data: ClustersResponse | null;
  loading: boolean;
}

export function ClustersTab({
  tool,
  k,
  onToolChange,
  onKChange,
  data,
  loading,
}: Props) {
  const { t, tr } = useTranslation();
  const { toolLabel } = useAnalyticsLabels();
  const levelLabel = (c: { level: string }) =>
    t(`app.analytics.clusters.level${c.level}`);
  const strategy = (c: { level: string }) =>
    t(`app.analytics.clusters.strategy${c.level}`);
  return (
    <div className="space-y-8">
      <TabHeader
        title={t("app.analytics.clusters.title")}
        question={t("app.analytics.clusters.question", {
          tool: toolLabel(tool),
        })}
      >
        <div className="flex flex-wrap items-center gap-2">
          <ToolTabs value={tool} onChange={onToolChange} />
          <div className="inline-flex rounded-xl bg-muted p-1">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onKChange(n)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold",
                  k === n
                    ? "bg-card text-brand-deep shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                k = {n}
              </button>
            ))}
          </div>
        </div>
      </TabHeader>

      <MethodCard
        compute={tr("app.analytics.clusters.compute")}
        read={tr("app.analytics.clusters.read")}
        lookFor={tr("app.analytics.clusters.lookFor")}
      />

      {loading || !data ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t("app.analytics.page.computing")}
        </p>
      ) : (
        <>
          <KeyFindings
            items={[
              tr("app.analytics.clusters.findingSummary", {
                k: data.k,
                n: data.clusters.length,
                list: data.clusters
                  .map((c) =>
                    t("app.analytics.clusters.clusterSummary", {
                      label: levelLabel(c),
                      size: c.size,
                      avg: fmt(c.avgGlobal),
                    })
                  )
                  .join(", "),
                iterations: data.iterations,
              }),
              ...data.clusters.map((c) =>
                tr("app.analytics.clusters.findingCluster", {
                  label: levelLabel(c),
                  strong: c.strongest?.name ?? "",
                  strongV: fmt(c.strongest?.value),
                  weak: c.weakest?.name ?? "",
                  weakV: fmt(c.weakest?.value),
                  strategy: strategy(c),
                })
              ),
              data.clusters.some((c) => c.size === 1) &&
                tr("app.analytics.clusters.findingSingleton", {
                  k: data.k,
                  suggested: Math.max(2, data.k - 1),
                }),
            ]}
          />

          <ChartCard
            title={t("app.analytics.clusters.radarTitle")}
            description={t("app.analytics.clusters.radarDescription")}
            height="h-[30rem]"
            howToRead={tr("app.analytics.clusters.radarRead")}
            aside={
              <Note>
                {t("app.analytics.clusters.sectionsNote")}{" "}
                {data.sections.map((s) => (
                  <span key={s.number} className="block">
                    S{s.number} = {s.name}
                  </span>
                ))}
              </Note>
            }
          >
            <ResponsiveContainer>
              <RadarChart
                data={data.sections.map((s) => ({
                  axis: `S${s.number}`,
                  name: s.name,
                  ...Object.fromEntries(
                    data.clusters.map((c, i) => [
                      `c${i}`,
                      c.centroid.find((x) => x.number === s.number)?.value ?? 0,
                    ])
                  ),
                }))}
                outerRadius="78%"
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" fontSize={13} />
                <PolarRadiusAxis
                  domain={[0, 10]}
                  tick={false}
                  axisLine={false}
                />
                {data.clusters.map((c, i) => (
                  <Radar
                    key={c.index}
                    name={levelLabel(c)}
                    dataKey={`c${i}`}
                    stroke={CLUSTER_COLORS[i]}
                    fill={CLUSTER_COLORS[i]}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 gap-6">
            {data.clusters.map((c, i) => (
              <div
                key={c.index}
                className="surface p-6"
                style={{ borderLeft: `6px solid ${CLUSTER_COLORS[i]}` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div
                      className="text-xl font-extrabold"
                      style={{ color: CLUSTER_COLORS[i] }}
                    >
                      {levelLabel(c)}
                    </div>
                    <div className="mt-1 text-base text-muted-foreground">
                      {t("app.analytics.clusters.clusterMeta", {
                        size: c.size,
                        avg: fmt(c.avgGlobal),
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-xl bg-success/10 px-3 py-1.5 font-semibold text-success">
                      ▲ {c.strongest?.name} · {fmt(c.strongest?.value)}
                    </span>
                    <span className="rounded-xl bg-danger/10 px-3 py-1.5 font-semibold text-danger">
                      ▼ {c.weakest?.name} · {fmt(c.weakest?.value)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-[15px] leading-relaxed">
                  <b>{t("app.analytics.clusters.strategy")}</b> {strategy(c)}
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {c.centroid.map((s) => (
                    <div
                      key={s.number}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-40 truncate" title={s.name}>
                        S{s.number}. {s.name}
                      </span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.value * 10}%`,
                            background: CLUSTER_COLORS[i],
                          }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold tabular-nums">
                        {fmt(s.value)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {c.members.map((m) => (
                    <span
                      key={m.profileId}
                      className="rounded-full bg-muted px-3.5 py-1.5 text-sm font-medium"
                      title={`${m.country} · ${fmt(m.globalScore)}`}
                    >
                      {m.profileName.replace(/^Demo — /, "")}{" "}
                      <span className="text-muted-foreground">
                        {fmt(m.globalScore)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
