import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  SegmentKey,
  SegmentsResponse,
} from "../../infrastructure/analytics-api";
import { TOOLS, TOOL_COLOR, fmt, useAnalyticsLabels } from "./analytics-ui";
import { useTranslation } from "@/shared/i18n/i18n";
import {
  ChartCard,
  KeyFindings,
  MethodCard,
  Note,
  TabHeader,
} from "./analytics-layout";
import { cn } from "@/shared/lib/utils";

const KEYS: { key: SegmentKey; label: string }[] = [
  { key: "country", label: "app.analytics.seg.keyCountry" },
  { key: "region", label: "app.analytics.seg.keyRegion" },
  { key: "type", label: "app.analytics.seg.keyType" },
  { key: "mainProduct", label: "app.analytics.seg.keyMainProduct" },
];
const TYPE_LABEL: Record<string, string> = {
  ASSOCIATION: "app.analytics.seg.typeASSOCIATION",
  COMPANY: "app.analytics.seg.typeCOMPANY",
};

export function SegmentsTab({
  by,
  onChange,
  data,
  loading,
}: {
  by: SegmentKey;
  onChange: (k: SegmentKey) => void;
  data: SegmentsResponse | null;
  loading: boolean;
}) {
  const { t, tr } = useTranslation();
  const { toolLabel } = useAnalyticsLabels();
  const groupName = (key: string) =>
    TYPE_LABEL[key] ? t(TYPE_LABEL[key]) : key;
  const label = (
    t(KEYS.find((k) => k.key === by)?.label ?? "") || by
  ).toLowerCase();
  const chart =
    data?.segments.map((s) => ({
      key: groupName(s.key),
      ...Object.fromEntries(TOOLS.map((t) => [t, s.tools[t].avgGlobal])),
    })) ?? [];
  const spreads = data
    ? TOOLS.map((t) => {
        const vals = data.segments
          .filter((s) => s.tools[t].n > 0)
          .map((s) => ({
            key: groupName(s.key),
            v: s.tools[t].avgGlobal,
            n: s.tools[t].n,
          }));
        if (vals.length < 2) return null;
        const max = vals.reduce((a, b) => (b.v > a.v ? b : a));
        const min = vals.reduce((a, b) => (b.v < a.v ? b : a));
        return { tool: t, max, min, diff: max.v - min.v };
      })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => b.diff - a.diff)
    : [];
  const smallGroups = data?.segments.filter((s) => s.organisations < 3) ?? [];

  return (
    <div className="space-y-8">
      <TabHeader
        title={t("app.analytics.seg.title")}
        question={t("app.analytics.seg.question", { label })}
      >
        <div className="inline-flex rounded-xl bg-muted p-1">
          {KEYS.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => onChange(k.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold",
                by === k.key
                  ? "bg-card text-brand-deep shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(k.label)}
            </button>
          ))}
        </div>
      </TabHeader>

      <MethodCard
        compute={tr("app.analytics.seg.compute", { label })}
        read={tr("app.analytics.seg.read")}
        lookFor={tr("app.analytics.seg.lookFor")}
      />

      {loading || !data ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t("app.analytics.page.computing")}
        </p>
      ) : (
        <>
          <KeyFindings
            items={[
              spreads[0] &&
                spreads[0].diff >= 0.3 &&
                tr("app.analytics.seg.findingSpread", {
                  tool: toolLabel(spreads[0].tool),
                  max: spreads[0].max.key,
                  maxV: fmt(spreads[0].max.v),
                  min: spreads[0].min.key,
                  minV: fmt(spreads[0].min.v),
                  diff: fmt(spreads[0].diff),
                  label,
                }),
              ...spreads.slice(1).map(
                (s) =>
                  s.diff >= 0.3 &&
                  tr("app.analytics.seg.findingOther", {
                    tool: toolLabel(s.tool),
                    diff: fmt(s.diff),
                    max: s.max.key,
                    maxV: fmt(s.max.v),
                    min: s.min.key,
                    minV: fmt(s.min.v),
                  })
              ),
              smallGroups.length > 0 &&
                tr("app.analytics.seg.findingSmall", {
                  groups: smallGroups.map((s) => groupName(s.key)).join(", "),
                }),
            ]}
          />

          <ChartCard
            title={t("app.analytics.seg.chartTitle", { label })}
            description={t("app.analytics.seg.chartDescription")}
            howToRead={tr("app.analytics.seg.chartRead")}
            aside={<Note>{t("app.analytics.seg.chartNote")}</Note>}
          >
            <ResponsiveContainer>
              <BarChart data={chart} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="key"
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
                  <Bar
                    key={t}
                    dataKey={t}
                    name={toolLabel(t)}
                    fill={TOOL_COLOR[t]}
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="surface overflow-x-auto">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-extrabold">
                {t("app.analytics.seg.detailTitle")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("app.analytics.seg.detailDescription")}
              </p>
            </div>
            <table className="w-full text-[15px]">
              <thead className="bg-muted/60">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">
                    {t("app.analytics.seg.colGroup")}
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    {t("app.analytics.seg.colOrganisations")}
                  </th>
                  {TOOLS.map((tool) => (
                    <th scope="col" key={tool} className="px-6 py-4 text-right">
                      {toolLabel(tool)}
                      <div className="text-xs font-normal normal-case text-muted-foreground">
                        {t("app.analytics.seg.colToolHint")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.segments.map((s) => (
                  <tr key={s.key} className="border-t">
                    <td className="px-6 py-4 text-base font-bold">
                      {groupName(s.key)}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      {s.organisations}
                    </td>
                    {TOOLS.map((t) => (
                      <td key={t} className="px-6 py-4 text-right tabular-nums">
                        <span
                          className="text-lg font-extrabold"
                          style={{ color: TOOL_COLOR[t] }}
                        >
                          {fmt(s.tools[t].avgGlobal)}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · σ {fmt(s.tools[t].stdDev)} ·{" "}
                          {s.tools[t].criticalKpiAvg}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
