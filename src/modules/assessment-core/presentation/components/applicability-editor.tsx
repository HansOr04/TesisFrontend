import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ListChecks } from "lucide-react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { fetchOrganizationalTemplates } from "@/modules/organizational-tool/infrastructure/organizational-api";
import { fetchCapacityTemplates } from "@/modules/capacity-tool/infrastructure/capacity-api";
import { fetchRiskTemplates } from "@/modules/risk-tool/infrastructure/risk-api";
import type { AssessmentTemplateData } from "@/modules/assessment-core/infrastructure/assessment-api";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/i18n/i18n";

export type ApplicabilityToolKey = "organizational" | "capacity" | "risk";

const TOOLS: {
  key: ApplicabilityToolKey;
  label: string;
  sectionLabel: string;
  color: string;
  fetch: typeof fetchOrganizationalTemplates;
}[] = [
  {
    key: "organizational",
    label: "app.analytics.tool.ORGANIZATIONAL",
    sectionLabel: "app.assessment.organizational.section",
    color: "#1D8FBF",
    fetch: fetchOrganizationalTemplates,
  },
  {
    key: "capacity",
    label: "app.analytics.tool.CAPACITY",
    sectionLabel: "app.assessment.capacity.section",
    color: "#F28C0F",
    fetch: fetchCapacityTemplates,
  },
  {
    key: "risk",
    label: "app.analytics.tool.RISK",
    sectionLabel: "app.assessment.risk.principle",
    color: "#1F9D5B",
    fetch: fetchRiskTemplates,
  },
];

export interface ApplicabilityEditorProps {
  excludedSectionIds: Set<string>;
  excludedIndicatorIds: Set<string>;
  onChange: (next: {
    excludedSectionIds: Set<string>;
    excludedIndicatorIds: Set<string>;
  }) => void;
}

// Editor de KPI aplicables por organización: carga la plantilla activa de
// cada herramienta y permite marcar secciones enteras o KPI individuales
// como "no aplica". Controlado: el padre guarda los sets de exclusión.
export function ApplicabilityEditor({
  excludedSectionIds,
  excludedIndicatorIds,
  onChange,
}: ApplicabilityEditorProps) {
  const auth = useAuth();
  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;
  const [templates, setTemplates] = useState<Record<
    ApplicabilityToolKey,
    AssessmentTemplateData | null
  > | null>(null);
  // `t` se usa como variable de iteración en este archivo: la traducción es `tr`.
  const { t: tr } = useTranslation();
  const [tool, setTool] = useState<ApplicabilityToolKey>("organizational");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!org || !token) return;
    let cancelled = false;
    Promise.all(TOOLS.map((t) => t.fetch(org, token)))
      .then(([o, c, r]) => {
        if (cancelled) return;
        const pick = (list: AssessmentTemplateData[]) =>
          list.find((x) => x.active) ?? list[0] ?? null;
        setTemplates({
          organizational: pick(o),
          capacity: pick(c),
          risk: pick(r),
        });
      })
      .catch((err) => console.error("Failed to load templates", err));
    return () => {
      cancelled = true;
    };
  }, [org, token]);

  const summary = useMemo(() => {
    if (!templates) return null;
    return Object.fromEntries(
      TOOLS.map((t) => {
        const tpl = templates[t.key];
        const total =
          tpl?.sections.reduce((a, s) => a + s.indicators.length, 0) ?? 0;
        const excluded =
          tpl?.sections.reduce(
            (a, s) =>
              a +
              (excludedSectionIds.has(s.id)
                ? s.indicators.length
                : s.indicators.filter((i) => excludedIndicatorIds.has(i.id))
                    .length),
            0
          ) ?? 0;
        return [t.key, { total, applicable: total - excluded }];
      })
    ) as Record<ApplicabilityToolKey, { total: number; applicable: number }>;
  }, [templates, excludedSectionIds, excludedIndicatorIds]);

  const toggleSection = (id: string) => {
    const next = new Set(excludedSectionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ excludedSectionIds: next, excludedIndicatorIds });
  };
  const toggleIndicator = (id: string) => {
    const next = new Set(excludedIndicatorIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ excludedSectionIds, excludedIndicatorIds: next });
  };
  const setAllInSection = (indicatorIds: string[], applicable: boolean) => {
    const next = new Set(excludedIndicatorIds);
    for (const id of indicatorIds) applicable ? next.delete(id) : next.add(id);
    onChange({ excludedSectionIds, excludedIndicatorIds: next });
  };

  if (!templates || !summary)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando plantillas…
      </p>
    );
  const current = TOOLS.find((t) => t.key === tool)!;
  const template = templates[tool];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTool(t.key)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all",
              tool === t.key
                ? "border-transparent shadow-card"
                : "border-border/70 hover:border-border"
            )}
            style={
              tool === t.key
                ? { background: `${t.color}14`, borderColor: t.color }
                : undefined
            }
          >
            <div className="text-sm font-bold" style={{ color: t.color }}>
              {tr(t.label)}
            </div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums">
              {summary[t.key].applicable}
              <span className="text-sm font-semibold text-muted-foreground">
                {" "}
                {tr("app.applicability.kpiSuffix", {
                  total: summary[t.key].total,
                })}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(summary[t.key].applicable / Math.max(1, summary[t.key].total)) * 100}%`,
                  background: t.color,
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {!template ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {tr("app.applicability.noTemplate")}
        </p>
      ) : (
        <div className="space-y-2">
          {template.sections.map((section) => {
            const sectionExcluded = excludedSectionIds.has(section.id);
            const open = openSections.has(section.id);
            const excludedCount = section.indicators.filter((i) =>
              excludedIndicatorIds.has(i.id)
            ).length;
            const applicable = sectionExcluded
              ? 0
              : section.indicators.length - excludedCount;
            return (
              <div
                key={section.id}
                className={cn(
                  "rounded-2xl border transition-colors",
                  sectionExcluded
                    ? "border-border/60 bg-muted/40"
                    : "border-border/70 bg-card"
                )}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[hsl(var(--brand))]"
                      checked={!sectionExcluded}
                      onChange={() => toggleSection(section.id)}
                    />
                    <span
                      className={cn(
                        "text-[15px] font-semibold",
                        sectionExcluded && "text-muted-foreground line-through"
                      )}
                    >
                      {tr(current.sectionLabel)} {section.number}:{" "}
                      {section.name}
                    </span>
                  </label>
                  <span
                    className={cn(
                      "ml-auto rounded-lg px-2 py-0.5 text-xs font-bold",
                      applicable === section.indicators.length
                        ? "bg-success/12 text-success"
                        : applicable === 0
                          ? "bg-muted text-muted-foreground"
                          : "bg-warning/15 text-warning"
                    )}
                  >
                    {tr("app.applicability.apply", {
                      applicable,
                      total: section.indicators.length,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections((s) => {
                        const n = new Set(s);
                        n.has(section.id)
                          ? n.delete(section.id)
                          : n.add(section.id);
                        return n;
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                    disabled={sectionExcluded}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                </div>
                {open && !sectionExcluded && (
                  <div className="border-t px-4 py-3">
                    <div className="mb-2 flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-deep hover:underline"
                        onClick={() =>
                          setAllInSection(
                            section.indicators.map((i) => i.id),
                            true
                          )
                        }
                      >
                        <ListChecks className="h-3.5 w-3.5" />{" "}
                        {tr("app.applicability.allApply")}
                      </button>
                      <button
                        type="button"
                        className="text-xs font-semibold text-muted-foreground hover:underline"
                        onClick={() =>
                          setAllInSection(
                            section.indicators.map((i) => i.id),
                            false
                          )
                        }
                      >
                        {tr("app.applicability.noneApply")}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                      {section.indicators.map((indicator) => {
                        const excluded = excludedIndicatorIds.has(indicator.id);
                        return (
                          <label
                            key={indicator.id}
                            className={cn(
                              "flex cursor-pointer items-start gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-muted/60",
                              excluded && "text-muted-foreground"
                            )}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 accent-[hsl(var(--brand))]"
                              checked={!excluded}
                              onChange={() => toggleIndicator(indicator.id)}
                            />
                            <span>
                              <span className="mr-1.5 rounded bg-muted px-1 font-mono text-[11px] font-bold">
                                {indicator.code}
                              </span>
                              <span className={cn(excluded && "line-through")}>
                                {indicator.name}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
