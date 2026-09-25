import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsOverview } from "../../infrastructure/analytics-api";
import {
  StatTile,
  TOOLS,
  TOOL_COLOR,
  fmt,
  pct,
  useAnalyticsLabels,
} from "./analytics-ui";
import { useTranslation } from "@/shared/i18n/i18n";
import {
  ChartCard,
  KeyFindings,
  MethodCard,
  Note,
  TabHeader,
} from "./analytics-layout";

export function OverviewTab({ data }: { data: AnalyticsOverview }) {
  const { t, tr } = useTranslation();
  const { toolLabel } = useAnalyticsLabels();
  const weakest = Object.fromEntries(
    data.perTool.map((t) => [
      t.tool,
      [...t.sectionAverages].sort((a, b) => a.avg - b.avg)[0],
    ])
  );
  const strongest = Object.fromEntries(
    data.perTool.map((t) => [
      t.tool,
      [...t.sectionAverages].sort((a, b) => b.avg - a.avg)[0],
    ])
  );
  const totalMeasures = data.perTool.reduce((a, t) => a + t.measures.total, 0);
  const doneMeasures = data.perTool.reduce((a, t) => a + t.measures.done, 0);
  const totalCritical = data.perTool.reduce((a, t) => a + t.criticalKpis, 0);
  const bestTool = [...data.perTool].sort(
    (a, b) => b.avgGlobal - a.avgGlobal
  )[0];
  const worstTool = [...data.perTool].sort(
    (a, b) => a.avgGlobal - b.avgGlobal
  )[0];
  const mostDispersed = [...data.perTool].sort(
    (a, b) => b.stdDevGlobal - a.stdDevGlobal
  )[0];
  const trendData = data.trend.map((row) => ({
    month: row.month,
    ...Object.fromEntries(TOOLS.map((t) => [t, row[t]?.avg ?? null])),
  }));
  const radarData = (() => {
    const max = Math.max(...data.perTool.map((t) => t.sectionAverages.length));
    return Array.from({ length: max }, (_, i) => ({
      axis: `S${i + 1}`,
      ...Object.fromEntries(
        data.perTool.map((t) => [t.tool, t.sectionAverages[i]?.avg ?? null])
      ),
    }));
  })();

  return (
    <div className="space-y-8">
      <TabHeader
        title={t("app.analytics.overview.title")}
        question={t("app.analytics.overview.question")}
      />

      <MethodCard
        compute={tr("app.analytics.overview.compute")}
        read={tr("app.analytics.overview.read")}
        lookFor={tr("app.analytics.overview.lookFor")}
      />

      <KeyFindings
        items={[
          tr("app.analytics.overview.findingBestWorst", {
            best: toolLabel(bestTool.tool),
            bestAvg: fmt(bestTool.avgGlobal),
            worst: toolLabel(worstTool.tool),
            worstAvg: fmt(worstTool.avgGlobal),
            worstCritical: worstTool.criticalOrganisations,
          }),
          tr("app.analytics.overview.findingDispersion", {
            tool: toolLabel(mostDispersed.tool),
            sd: fmt(mostDispersed.stdDevGlobal),
          }),
          ...data.perTool.map((row) =>
            tr("app.analytics.overview.findingSections", {
              tool: toolLabel(row.tool),
              weak: `${weakest[row.tool]?.number}. ${weakest[row.tool]?.name}`,
              weakAvg: fmt(weakest[row.tool]?.avg),
              weakRate: pct(weakest[row.tool]?.criticalRate ?? 0),
              strong: `${strongest[row.tool]?.number}. ${strongest[row.tool]?.name}`,
              strongAvg: fmt(strongest[row.tool]?.avg),
            })
          ),
          tr("app.analytics.overview.findingCoverage", {
            critical: totalCritical,
            measures: totalMeasures,
            done: doneMeasures,
            coverage: pct(
              data.perTool.reduce((a, row) => a + row.measures.coverage, 0) /
                data.perTool.length
            ),
          }),
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t("app.analytics.overview.statOrganisations")}
          value={data.organisations}
          hint={t("app.analytics.overview.statOrganisationsHint", {
            n: data.evaluatedOrganisations,
          })}
        />
        <StatTile
          label={t("app.analytics.overview.statCritical")}
          value={totalCritical}
          tone="danger"
          hint={t("app.analytics.overview.statCriticalHint")}
        />
        <StatTile
          label={t("app.analytics.overview.statMeasures")}
          value={totalMeasures}
          tone="warning"
          hint={t("app.analytics.overview.statMeasuresHint", {
            done: doneMeasures,
            pct: totalMeasures
              ? Math.round((doneMeasures / totalMeasures) * 100)
              : 0,
          })}
        />
        <StatTile
          label={t("app.analytics.overview.statCoverage")}
          value={pct(
            data.perTool.reduce((a, t) => a + t.measures.coverage, 0) /
              data.perTool.length
          )}
          tone="muted"
          hint={t("app.analytics.overview.statCoverageHint")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {data.perTool.map((row) => (
          <div
            key={row.tool}
            className="surface p-6"
            style={{ borderTop: `4px solid ${TOOL_COLOR[row.tool]}` }}
          >
            <div className="text-lg font-extrabold">{toolLabel(row.tool)}</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-3xl font-extrabold tabular-nums">
                  {fmt(row.avgGlobal)}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("app.analytics.overview.mean")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold tabular-nums">
                  {fmt(row.medianGlobal)}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("app.analytics.overview.median")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold tabular-nums">
                  {fmt(row.stdDevGlobal)}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  σ
                </div>
              </div>
            </div>
            <div className="mt-4 flex overflow-hidden rounded-full">
              <div
                className="h-3 bg-danger"
                style={{
                  width: `${(row.criticalOrganisations / Math.max(1, row.evaluatedOrganisations)) * 100}%`,
                }}
                title={t("app.analytics.overview.criticalOrgs")}
              />
              <div
                className="h-3 bg-warning"
                style={{
                  width: `${((row.evaluatedOrganisations - row.criticalOrganisations - row.highOrganisations) / Math.max(1, row.evaluatedOrganisations)) * 100}%`,
                }}
                title={t("app.analytics.overview.mediumOrgs")}
              />
              <div
                className="h-3 bg-success"
                style={{
                  width: `${(row.highOrganisations / Math.max(1, row.evaluatedOrganisations)) * 100}%`,
                }}
                title={t("app.analytics.overview.highOrgs")}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>
                <b className="text-danger">{row.criticalOrganisations}</b>{" "}
                {t("app.analytics.overview.criticalOrgs")}
              </span>
              <span>
                <b className="text-warning">
                  {row.evaluatedOrganisations -
                    row.criticalOrganisations -
                    row.highOrganisations}
                </b>{" "}
                {t("app.analytics.overview.mediumOrgs")}
              </span>
              <span>
                <b className="text-success">{row.highOrganisations}</b>{" "}
                {t("app.analytics.overview.highOrgs")}
              </span>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {t("app.analytics.overview.toolSummary", {
                orgs: row.evaluatedOrganisations,
                critical: row.criticalKpis,
                done: row.measures.done,
                total: row.measures.total,
                progress: row.measures.avgProgress,
              })}
            </div>
          </div>
        ))}
      </div>

      {data.perTool.map((row) => (
        <ChartCard
          key={row.tool}
          title={t("app.analytics.overview.histTitle", {
            tool: toolLabel(row.tool),
          })}
          description={t("app.analytics.overview.histDescription")}
          height="h-72"
          howToRead={tr("app.analytics.overview.histRead")}
          aside={
            <Note>
              {t("app.analytics.overview.histNote", {
                mean: fmt(row.avgGlobal),
                median: fmt(row.medianGlobal),
                tail:
                  row.medianGlobal > row.avgGlobal
                    ? t("app.analytics.overview.histNoteMedianAbove")
                    : row.medianGlobal < row.avgGlobal
                      ? t("app.analytics.overview.histNoteMeanAbove")
                      : t("app.analytics.overview.histNoteEqual"),
              })}
            </Note>
          }
        >
          <ResponsiveContainer>
            <BarChart
              data={row.histogram.map((b) => ({
                range: `${b.from}–${b.to}`,
                count: b.count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="range"
                fontSize={13}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                fontSize={13}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                name={t("app.analytics.overview.seriesOrganisations")}
                fill={TOOL_COLOR[row.tool]}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ))}

      <ChartCard
        title={t("app.analytics.overview.radarTitle")}
        description={t("app.analytics.overview.radarDescription")}
        howToRead={tr("app.analytics.overview.radarRead")}
        aside={
          <Note>
            {t("app.analytics.overview.radarNote", {
              list: data.perTool
                .map(
                  (row) =>
                    `${toolLabel(row.tool)} → S${weakest[row.tool]?.number}`
                )
                .join(" · "),
            })}
          </Note>
        }
      >
        <ResponsiveContainer>
          <RadarChart data={radarData} outerRadius="78%">
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" fontSize={13} />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            {TOOLS.map((t) => (
              <Radar
                key={t}
                name={toolLabel(t)}
                dataKey={t}
                stroke={TOOL_COLOR[t]}
                fill={TOOL_COLOR[t]}
                fillOpacity={0.12}
              />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={t("app.analytics.overview.trendTitle")}
        description={t("app.analytics.overview.trendDescription")}
        howToRead={tr("app.analytics.overview.trendRead")}
      >
        {trendData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t("app.analytics.overview.trendEmpty")}
          </p>
        ) : (
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                fontSize={13}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 10]}
                fontSize={13}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip />
              <Legend />
              {TOOLS.map((t) => (
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  name={toolLabel(t)}
                  stroke={TOOL_COLOR[t]}
                  strokeWidth={3}
                  connectNulls
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="surface overflow-x-auto">
        <div className="p-6 pb-2">
          <h3 className="text-lg font-extrabold">
            {t("app.analytics.overview.detailTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("app.analytics.overview.detailDescription")}
          </p>
        </div>
        <table className="w-full text-[15px]">
          <thead className="bg-muted/60">
            <tr>
              <th scope="col" className="px-6 py-4 text-left">
                {t("app.analytics.overview.colTool")}
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                {t("app.analytics.overview.colSection")}
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                {t("app.analytics.overview.colMean")}
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                {t("app.analytics.overview.colRange")}
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                {t("app.analytics.overview.colCriticalOrgs")}
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                {t("app.analytics.overview.colWeight")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.perTool.flatMap((t) =>
              t.sectionAverages.map((s) => (
                <tr key={`${t.tool}-${s.number}`} className="border-t">
                  <td className="px-6 py-3">
                    <span
                      className="rounded-lg px-2 py-1 text-xs font-bold text-white"
                      style={{ background: TOOL_COLOR[t.tool] }}
                    >
                      {toolLabel(t.tool)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {s.number}. {s.name}
                  </td>
                  <td
                    className="px-6 py-3 text-right text-lg font-extrabold tabular-nums"
                    style={{
                      color:
                        s.avg <= 5
                          ? "#DC3D43"
                          : s.avg < 7
                            ? "#F28C0F"
                            : "#1F9D5B",
                    }}
                  >
                    {fmt(s.avg)}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                    {fmt(s.min)} – {fmt(s.max)}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums">
                    {pct(s.criticalRate)}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                    {s.weight}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
