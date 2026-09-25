import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AnalyticsTool,
  GapsResponse,
} from "../../infrastructure/analytics-api";
import {
  ToolTabs,
  TOOL_COLOR,
  fmt,
  heatAlpha,
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
import { GapsRanking } from "./gaps-ranking";

interface Props {
  tool: AnalyticsTool;
  onToolChange: (t: AnalyticsTool) => void;
  data: GapsResponse | null;
  loading: boolean;
}

export function GapsTab({ tool, onToolChange, data, loading }: Props) {
  const { t, tr } = useTranslation();
  const { toolLabel } = useAnalyticsLabels();
  const top = data?.gaps.slice(0, 10) ?? [];
  const uncovered =
    data?.gaps
      .filter((g) => g.criticalCount > 0 && g.measureCoverage < 0.5)
      .slice(0, 3) ?? [];
  const sectionCounts = data
    ? data.sections
        .map((s) => ({
          ...s,
          critical: data.gaps
            .filter((g) => g.sectionNumber === s.number)
            .reduce((a, g) => a + g.criticalCount, 0),
        }))
        .sort((a, b) => b.critical - a.critical)
    : [];
  const weakestOrg = data?.heatmap[0];

  return (
    <div className="space-y-8">
      <TabHeader
        title={t("app.analytics.gaps.title")}
        question={t("app.analytics.gaps.question", { tool: toolLabel(tool) })}
      >
        <ToolTabs value={tool} onChange={onToolChange} />
      </TabHeader>

      <MethodCard
        compute={tr("app.analytics.gaps.compute")}
        read={tr("app.analytics.gaps.read")}
        lookFor={tr("app.analytics.gaps.lookFor")}
      />

      {loading || !data ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t("app.analytics.page.computing")}
        </p>
      ) : (
        <>
          <KeyFindings
            items={[
              top[0] &&
                tr("app.analytics.gaps.findingTop", {
                  kpi: `${top[0].code} — ${top[0].name}`,
                  rate: pct(top[0].criticalRate),
                  orgs: data.organisations,
                  avg: fmt(top[0].avgScore),
                  coverage: pct(top[0].measureCoverage),
                }),
              uncovered.length > 0 &&
                tr("app.analytics.gaps.findingUncovered", {
                  codes: uncovered.map((g) => g.code).join(", "),
                }),
              sectionCounts[0] &&
                tr("app.analytics.gaps.findingSection", {
                  section: `${sectionCounts[0].number}. ${sectionCounts[0].name}`,
                  count: sectionCounts[0].critical,
                }),
              weakestOrg &&
                tr("app.analytics.gaps.findingWeakestOrg", {
                  org: weakestOrg.profileName.replace(/^Demo — /, ""),
                  score: fmt(weakestOrg.globalScore),
                }),
            ]}
          />

          <ChartCard
            title={t("app.analytics.gaps.topTitle")}
            description={t("app.analytics.gaps.topDescription")}
            howToRead={tr("app.analytics.gaps.topRead")}
            aside={
              <Note>
                {t("app.analytics.gaps.topNote", {
                  value: top[0]?.priority.toFixed(2) ?? "0",
                })}
              </Note>
            }
          >
            <ResponsiveContainer>
              <BarChart
                data={top}
                layout="vertical"
                margin={{ left: 8, right: 32 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="code"
                  width={72}
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: number, _n, p) => [
                    t("app.analytics.gaps.tooltipValue", {
                      value: v,
                      rate: pct(
                        (p.payload as { criticalRate: number }).criticalRate
                      ),
                    }),
                    t("app.analytics.gaps.tooltipPriority"),
                  ]}
                  labelFormatter={(l, p) =>
                    `${l} — ${(p?.[0]?.payload as { name: string })?.name ?? ""}`
                  }
                />
                <Bar
                  dataKey="priority"
                  fill={TOOL_COLOR[tool]}
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="surface p-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
              <div className="min-w-0 overflow-x-auto">
                <h3 className="text-lg font-extrabold">
                  {t("app.analytics.gaps.heatTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("app.analytics.gaps.heatDescription")}
                </p>
                <table className="mt-5 w-full text-[15px]">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        {t("app.analytics.gaps.colOrganisation")}
                      </th>
                      {data.sections.map((s) => (
                        <th
                          scope="col"
                          key={s.number}
                          className="px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          title={s.name}
                        >
                          S{s.number}
                        </th>
                      ))}
                      <th
                        scope="col"
                        className="px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        {t("app.analytics.gaps.colGlobal")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.heatmap.map((row) => (
                      <tr key={row.profileId}>
                        <td
                          className="max-w-[280px] truncate py-1 pr-4 font-medium"
                          title={row.profileName}
                        >
                          {row.profileName.replace(/^Demo — /, "")}
                        </td>
                        {row.sections.map((s) => (
                          <td key={s.number} className="px-1 py-1">
                            <div
                              className="rounded-xl py-3 text-center font-bold tabular-nums"
                              style={{ background: heatAlpha(s.score) }}
                              title={`S${s.number}: ${fmt(s.score)}`}
                            >
                              {fmt(s.score)}
                            </div>
                          </td>
                        ))}
                        <td className="px-1 py-1">
                          <div
                            className="rounded-xl py-3 text-center font-extrabold tabular-nums"
                            style={{ background: heatAlpha(row.globalScore) }}
                          >
                            {fmt(row.globalScore)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-muted/50 p-5">
                  <div className="text-sm font-bold">
                    {t("app.analytics.gaps.heatHow")}
                  </div>
                  <div className="mt-2 text-[15px] leading-relaxed text-foreground/80">
                    {tr("app.analytics.gaps.heatRead")}
                  </div>
                </div>
                <Note>
                  {t("app.analytics.gaps.sectionsNote")}{" "}
                  {data.sections.map((s) => (
                    <span key={s.number} className="block">
                      S{s.number} = {s.name}
                    </span>
                  ))}
                </Note>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-extrabold">
              {t("app.analytics.gaps.rankingTitle")}
            </h3>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              {t("app.analytics.gaps.rankingDescription")}
            </p>
            <GapsRanking data={data} tool={tool} />
          </div>
        </>
      )}
    </div>
  );
}
