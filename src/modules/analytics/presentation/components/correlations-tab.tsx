import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { CorrelationsResponse } from "../../infrastructure/analytics-api";
import {
  TOOLS,
  TOOL_COLOR,
  TOOL_SHORT,
  corrColor,
  fmt,
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

export function CorrelationsTab({ data }: { data: CorrelationsResponse }) {
  const { t, tr } = useTranslation();
  const { toolLabel, strengthLabel } = useAnalyticsLabels();
  const topDrivers = data.drivers.map((d) => ({
    tool: d.tool,
    s: d.sections[0],
    n: d.n,
  }));
  const strongestGlobal = [...data.globalCross].sort(
    (a, b) => Math.abs(b.r ?? 0) - Math.abs(a.r ?? 0)
  )[0];
  const topPair = data.topCrossTool[0];
  const factorInsights = data.profileFactors
    .flatMap((f) => [
      { tool: f.tool, key: "members" as const, e: f.memberCount },
      { tool: f.tool, key: "age" as const, e: f.age },
    ])
    .filter(
      (x) =>
        x.e.r !== null &&
        (x.e.strength === "strong" || x.e.strength === "moderate")
    )
    .sort((a, b) => Math.abs(b.e.r ?? 0) - Math.abs(a.e.r ?? 0));

  return (
    <div className="space-y-8">
      <TabHeader
        title={t("app.analytics.corr.title")}
        question={t("app.analytics.corr.question")}
      />

      <MethodCard
        compute={tr("app.analytics.corr.compute")}
        read={tr("app.analytics.corr.read", { minSample: data.minSample })}
        lookFor={tr("app.analytics.corr.lookFor")}
      />

      <KeyFindings
        items={[
          strongestGlobal &&
            strongestGlobal.r !== null &&
            tr("app.analytics.corr.findingGlobal", {
              toolA: toolLabel(strongestGlobal.toolA),
              toolB: toolLabel(strongestGlobal.toolB),
              strength: strengthLabel(strongestGlobal.strength),
              r: fmt(strongestGlobal.r, 2),
              n: strongestGlobal.n,
            }),
          ...topDrivers.map(
            (d) =>
              d.s &&
              tr("app.analytics.corr.findingDriver", {
                tool: toolLabel(d.tool),
                section: `${d.s.number}. ${d.s.name}`,
                r: fmt(d.s.r, 2),
              })
          ),
          topPair &&
            tr("app.analytics.corr.findingPair", {
              a: `${TOOL_SHORT[topPair.toolA]}-${topPair.sectionA} ${topPair.nameA}`,
              b: `${TOOL_SHORT[topPair.toolB]}-${topPair.sectionB} ${topPair.nameB}`,
              r: fmt(topPair.r, 2),
            }),
          factorInsights[0] &&
            tr("app.analytics.corr.findingFactor", {
              factor:
                factorInsights[0].key === "age"
                  ? t("app.analytics.corr.factorAge")
                  : t("app.analytics.corr.factorMembers"),
              tool: toolLabel(factorInsights[0].tool),
              r: fmt(factorInsights[0].e.r, 2),
              strength: strengthLabel(factorInsights[0].e.strength),
              slope: factorInsights[0].e.regression
                ? t("app.analytics.corr.slopeSuffix", {
                    slope: factorInsights[0].e.regression.slope.toFixed(3),
                  })
                : "",
              group:
                factorInsights[0].key === "age"
                  ? t("app.analytics.corr.groupYounger")
                  : t("app.analytics.corr.groupSmaller"),
            }),
        ]}
      />

      <div className="surface p-6">
        <h3 className="text-lg font-extrabold">
          {t("app.analytics.corr.driversTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("app.analytics.corr.driversDescription")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {data.drivers.map((d) => (
            <div
              key={d.tool}
              className="rounded-2xl bg-muted/40 p-5"
              style={{ borderTop: `4px solid ${TOOL_COLOR[d.tool]}` }}
            >
              <div className="text-base font-extrabold">
                {toolLabel(d.tool)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (n = {d.n})
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {d.sections.map((s, i) => (
                  <li key={s.number} className="text-[15px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={s.name}>
                        {i === 0 && "★ "}
                        {s.number}. {s.name}
                      </span>
                      <span className="shrink-0 font-extrabold tabular-nums">
                        {fmt(s.r, 2)}
                      </span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.abs(s.r ?? 0) * 100}%`,
                          background: TOOL_COLOR[d.tool],
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Note>{tr("app.analytics.corr.driversNote")}</Note>
      </div>

      {data.globalCross.map((g) => (
        <ChartCard
          key={`${g.toolA}-${g.toolB}`}
          title={t("app.analytics.corr.scatterTitle", {
            toolA: toolLabel(g.toolA),
            toolB: toolLabel(g.toolB),
          })}
          description={t("app.analytics.corr.scatterDescription", {
            r: fmt(g.r, 2),
            strength: strengthLabel(g.strength),
            n: g.n,
          })}
          height="h-80"
          howToRead={tr("app.analytics.corr.scatterRead", {
            toolA: toolLabel(g.toolA),
            toolB: toolLabel(g.toolB),
          })}
        >
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 10]}
                fontSize={13}
                name={toolLabel(g.toolA)}
                label={{
                  value: toolLabel(g.toolA),
                  position: "insideBottom",
                  offset: -6,
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 10]}
                fontSize={13}
                name={toolLabel(g.toolB)}
              />
              <ZAxis range={[90, 90]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={g.points.filter((p) => p.x !== null && p.y !== null)}
                fill={TOOL_COLOR[g.toolA]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      ))}

      <div className="surface p-6">
        <h3 className="text-lg font-extrabold">
          {t("app.analytics.corr.matrixTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("app.analytics.corr.matrixDescription")}
        </p>
        {(
          [
            "ORGANIZATIONAL-CAPACITY",
            "ORGANIZATIONAL-RISK",
            "CAPACITY-RISK",
          ] as const
        ).map((pair) => {
          const [a, b] = pair.split("-") as [
            (typeof TOOLS)[number],
            (typeof TOOLS)[number],
          ];
          const cells = data.crossTool.filter(
            (c) => c.toolA === a && c.toolB === b
          );
          const rows = [...new Set(cells.map((c) => c.sectionA))];
          const cols = [...new Set(cells.map((c) => c.sectionB))];
          if (rows.length === 0) return null;
          return (
            <div key={pair} className="mt-8 overflow-x-auto">
              <div className="mb-3 text-base font-bold">
                {t("app.analytics.corr.matrixPair", {
                  a: toolLabel(a),
                  b: toolLabel(b),
                })}
              </div>
              <table className="text-[15px]">
                <thead>
                  <tr>
                    <th scope="col" />
                    {cols.map((c) => (
                      <th
                        scope="col"
                        key={c}
                        className="px-1 py-2 font-semibold"
                        title={cells.find((x) => x.sectionB === c)?.nameB}
                      >
                        {TOOL_SHORT[b]}-{c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r}>
                      <th
                        scope="col"
                        className="pr-3 text-left font-semibold"
                        title={cells.find((x) => x.sectionA === r)?.nameA}
                      >
                        {TOOL_SHORT[a]}-{r}
                      </th>
                      {cols.map((c) => {
                        const cell = cells.find(
                          (x) => x.sectionA === r && x.sectionB === c
                        );
                        return (
                          <td key={c} className="p-1">
                            <div
                              className="w-20 rounded-xl py-3 text-center font-bold tabular-nums"
                              style={{ background: corrColor(cell?.r ?? null) }}
                              title={`${cell?.nameA} × ${cell?.nameB}: r=${fmt(cell?.r ?? null, 2)} (n=${cell?.n})`}
                            >
                              {fmt(cell?.r ?? null, 2)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        <div className="mt-6">
          <Note>{tr("app.analytics.corr.matrixNote")}</Note>
        </div>
      </div>

      <div className="surface p-6">
        <h3 className="text-lg font-extrabold">
          {t("app.analytics.corr.factorsTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("app.analytics.corr.factorsDescription")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {data.profileFactors.map((f) => (
            <div
              key={f.tool}
              className="rounded-2xl bg-muted/40 p-5"
              style={{ borderTop: `4px solid ${TOOL_COLOR[f.tool]}` }}
            >
              <div className="text-base font-extrabold">
                {toolLabel(f.tool)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[
                  { label: t("app.analytics.corr.members"), e: f.memberCount },
                  { label: t("app.analytics.corr.ageYears"), e: f.age },
                ].map(({ label, e }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-card p-5 text-center shadow-sm"
                  >
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </div>
                    <div
                      className="mt-2 text-4xl font-extrabold tabular-nums"
                      style={{ color: TOOL_COLOR[f.tool] }}
                    >
                      {fmt(e.r, 2)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("app.analytics.corr.nSuffix", {
                        strength: strengthLabel(e.strength),
                        n: e.n,
                      })}
                    </div>
                    {e.regression && (
                      <div className="mt-2 text-sm text-foreground/80">
                        {t("app.analytics.corr.regression", {
                          slope: `${e.regression.slope >= 0 ? "+" : ""}${e.regression.slope.toFixed(3)}`,
                          r2: e.regression.r2,
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Note>{tr("app.analytics.corr.factorsNote")}</Note>
        </div>
      </div>
    </div>
  );
}
