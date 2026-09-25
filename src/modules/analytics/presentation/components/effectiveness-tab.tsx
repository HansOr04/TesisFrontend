import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EffectivenessResponse } from "../../infrastructure/analytics-api";
import { TOOL_COLOR, fmt, pct, useAnalyticsLabels } from "./analytics-ui";
import { useTranslation } from "@/shared/i18n/i18n";
import {
  ChartCard,
  KeyFindings,
  MethodCard,
  Note,
  TabHeader,
} from "./analytics-layout";

const GROUP_KEYS = [
  "withDoneMeasure",
  "withOpenMeasure",
  "withoutMeasure",
  "nonCritical",
] as const;
const GROUP_LABEL: Record<(typeof GROUP_KEYS)[number], string> = {
  withDoneMeasure: "app.analytics.eff.groupWithDoneMeasure",
  withOpenMeasure: "app.analytics.eff.groupWithOpenMeasure",
  withoutMeasure: "app.analytics.eff.groupWithoutMeasure",
  nonCritical: "app.analytics.eff.groupNonCritical",
};

export function EffectivenessTab({ data }: { data: EffectivenessResponse }) {
  const { t, tr } = useTranslation();
  const { toolLabel, strengthLabel } = useAnalyticsLabels();
  const withHistory = data.perTool.filter(
    (row) => row.organisationsWithHistory > 0
  );
  const best = [...withHistory].sort((a, b) => b.effect - a.effect)[0];
  return (
    <div className="space-y-8">
      <TabHeader
        title={t("app.analytics.eff.title")}
        question={t("app.analytics.eff.question")}
      />

      <MethodCard
        compute={tr("app.analytics.eff.compute")}
        read={tr("app.analytics.eff.read")}
        lookFor={tr("app.analytics.eff.lookFor")}
      />

      {withHistory.length === 0 ? (
        <Note>{t("app.analytics.eff.noHistory")}</Note>
      ) : (
        <>
          <KeyFindings
            items={[
              best &&
                tr("app.analytics.eff.findingBest", {
                  tool: toolLabel(best.tool),
                  done: fmt(best.groups.withDoneMeasure.avgDelta, 2),
                  improved: pct(best.groups.withDoneMeasure.improvedRate),
                  none: fmt(best.groups.withoutMeasure.avgDelta, 2),
                  effect: fmt(best.effect, 2),
                }),
              ...withHistory
                .filter((row) => row !== best)
                .map((row) =>
                  tr("app.analytics.eff.findingOther", {
                    tool: toolLabel(row.tool),
                    effect: fmt(row.effect, 2),
                    orgs: row.organisationsWithHistory,
                    done: fmt(row.groups.withDoneMeasure.avgDelta, 2),
                    open: fmt(row.groups.withOpenMeasure.avgDelta, 2),
                    none: fmt(row.groups.withoutMeasure.avgDelta, 2),
                  })
                ),
              ...withHistory.map((row) =>
                tr("app.analytics.eff.findingControl", {
                  tool: toolLabel(row.tool),
                  delta: fmt(row.groups.nonCritical.avgDelta, 2),
                  tail:
                    Math.abs(row.groups.nonCritical.avgDelta) < 0.3
                      ? t("app.analytics.eff.controlStable")
                      : t("app.analytics.eff.controlMoved"),
                })
              ),
              ...withHistory.map(
                (row) =>
                  row.doneRatioVsDelta.r !== null &&
                  tr("app.analytics.eff.findingDoneRatio", {
                    tool: toolLabel(row.tool),
                    strength: strengthLabel(row.doneRatioVsDelta.strength),
                    r: fmt(row.doneRatioVsDelta.r, 2),
                    tail:
                      row.doneRatioVsDelta.strength === "strong" ||
                      row.doneRatioVsDelta.strength === "moderate"
                        ? t("app.analytics.eff.doneRatioStrong")
                        : t("app.analytics.eff.doneRatioWeak"),
                  })
              ),
            ]}
          />

          {withHistory.map((row) => {
            const chart = GROUP_KEYS.map((k) => ({
              group: t(GROUP_LABEL[k]),
              delta: row.groups[k].avgDelta,
              n: row.groups[k].n,
              improved: row.groups[k].improvedRate,
            }));
            return (
              <ChartCard
                key={row.tool}
                title={t("app.analytics.eff.chartTitle", {
                  tool: toolLabel(row.tool),
                })}
                description={t("app.analytics.eff.chartDescription", {
                  orgs: row.organisationsWithHistory,
                  delta: `${row.avgGlobalDelta >= 0 ? "+" : ""}${fmt(row.avgGlobalDelta, 2)}`,
                })}
                height="h-80"
                howToRead={tr("app.analytics.eff.chartRead")}
                aside={
                  <Note>
                    {chart.map((c) => (
                      <span key={c.group} className="block">
                        {t("app.analytics.eff.groupNote", {
                          group: c.group,
                          n: c.n,
                          improved: pct(c.improved),
                        })}
                      </span>
                    ))}
                  </Note>
                }
              >
                <ResponsiveContainer>
                  <BarChart
                    data={chart}
                    margin={{ left: -8, bottom: 8 }}
                    barCategoryGap={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="group"
                      fontSize={13}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis fontSize={13} tickLine={false} axisLine={false} />
                    <ReferenceLine y={0} stroke="#999" />
                    <Tooltip
                      formatter={(v: number, _n, p) => [
                        t("app.analytics.eff.tooltipValue", {
                          value: v.toFixed(2),
                          n: (p.payload as { n: number }).n,
                        }),
                        t("app.analytics.eff.tooltipDelta"),
                      ]}
                    />
                    <Bar dataKey="delta" radius={[8, 8, 0, 0]}>
                      {chart.map((c, i) => (
                        <Cell
                          key={i}
                          fill={c.delta >= 0 ? TOOL_COLOR[row.tool] : "#DC3D43"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            );
          })}

          {withHistory.map((row) => (
            <div key={row.tool} className="surface overflow-x-auto">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-extrabold">
                  {t("app.analytics.eff.tableTitle", {
                    tool: toolLabel(row.tool),
                  })}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("app.analytics.eff.tableDescription")}
                </p>
              </div>
              <table className="w-full text-[15px]">
                <thead className="bg-muted/60">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left">
                      {t("app.analytics.eff.colOrganisation")}
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      {t("app.analytics.eff.colFirst")}
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      {t("app.analytics.eff.colLast")}
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      {t("app.analytics.eff.colDelta")}
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      {t("app.analytics.eff.colDone")}
                    </th>
                    <th scope="col" className="px-6 py-4 text-left">
                      {t("app.analytics.eff.colPeriod")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {row.organisations.map((o) => (
                    <tr key={o.profileId} className="border-t">
                      <td className="px-6 py-4 font-semibold">
                        {o.profileName.replace(/^Demo — /, "")}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums">
                        {fmt(o.firstScore)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums">
                        {fmt(o.lastScore)}
                      </td>
                      <td
                        className="px-6 py-4 text-right text-lg font-extrabold tabular-nums"
                        style={{ color: o.delta >= 0 ? "#1F9D5B" : "#DC3D43" }}
                      >
                        {o.delta >= 0 ? "+" : ""}
                        {fmt(o.delta, 2)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums">
                        {o.measuresDone}/{o.measuresTotal}{" "}
                        <span className="text-muted-foreground">
                          (
                          {o.measuresTotal
                            ? Math.round(
                                (o.measuresDone / o.measuresTotal) * 100
                              )
                            : 0}
                          %)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(o.firstDate).toLocaleDateString()} →{" "}
                        {new Date(o.lastDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
