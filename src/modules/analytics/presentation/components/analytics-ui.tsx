import { Lightbulb } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/i18n/i18n";
import { SCORE_COLORS, scoreColor } from "@/shared/design/score-colors";
import type {
  AnalyticsTool,
  CorrelationStrength,
} from "../../infrastructure/analytics-api";

/**
 * Etiquetas traducidas de herramientas y fuerzas de correlación. Las páginas
 * de analítica las obtienen con `useAnalyticsLabels()`.
 */
export function useAnalyticsLabels() {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      toolLabel: (tool: AnalyticsTool) => t(`app.analytics.tool.${tool}`),
      strengthLabel: (s: CorrelationStrength) =>
        t(`app.analytics.strength.${s}`),
    }),
    [t]
  );
}
export const TOOL_SHORT: Record<AnalyticsTool, string> = {
  ORGANIZATIONAL: "ORG",
  CAPACITY: "CAP",
  RISK: "RIE",
};
export const TOOL_COLOR: Record<AnalyticsTool, string> = {
  ORGANIZATIONAL: "#1F9D5B",
  CAPACITY: "#F28C0F",
  RISK: "#1D8FBF",
};
export const TOOLS: AnalyticsTool[] = ["ORGANIZATIONAL", "CAPACITY", "RISK"];

/** Color de celda para mapas de calor 0–10 (rojo → ámbar → verde). */
export function heatColor(value: number | null): string {
  if (value === null || Number.isNaN(value)) return SCORE_COLORS.track;
  return scoreColor(value);
}

export function heatAlpha(value: number | null): string {
  if (value === null) return "transparent";
  const c = scoreColor(value);
  const intensity =
    value <= 5
      ? 0.15 + (5 - value) * 0.1
      : value < 7
        ? 0.2
        : 0.15 + (value - 7) * 0.12;
  return `${c}${Math.round(Math.min(0.85, intensity) * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

/** Color para correlaciones −1..1 (azul negativo, verde positivo). */
export function corrColor(r: number | null): string {
  if (r === null) return "transparent";
  const a = Math.min(1, Math.abs(r));
  const alpha = Math.round((0.08 + a * 0.75) * 255)
    .toString(16)
    .padStart(2, "0");
  return r >= 0 ? `#1F9D5B${alpha}` : `#1D8FBF${alpha}`;
}

export function StatTile({
  label,
  value,
  hint,
  tone = "brand",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "brand" | "danger" | "warning" | "success" | "muted";
}) {
  const tones = {
    brand: "bg-brand/8 text-brand-deep",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/12 text-warning",
    success: "bg-success/12 text-success",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className="surface p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 inline-block rounded-lg px-2 py-0.5 text-2xl font-extrabold tabular-nums",
          tones[tone]
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/** Hallazgo en lenguaje natural derivado de los datos (para la memoria). */
export function Insight({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "warning" | "danger" | "success";
}) {
  const tones = {
    brand: "border-brand/30 bg-brand/5 text-brand-deep",
    warning: "border-warning/40 bg-warning/8 text-warning",
    danger: "border-danger/30 bg-danger/5 text-danger",
    success: "border-success/30 bg-success/5 text-success",
  };
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm",
        tones[tone]
      )}
    >
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="text-foreground/85">{children}</span>
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-extrabold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

export function ToolTabs({
  value,
  onChange,
}: {
  value: AnalyticsTool;
  onChange: (t: AnalyticsTool) => void;
}) {
  const { toolLabel } = useAnalyticsLabels();
  return (
    <div className="inline-flex rounded-xl bg-muted p-1">
      {TOOLS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            value === t
              ? "bg-card shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          style={value === t ? { color: TOOL_COLOR[t] } : undefined}
        >
          {toolLabel(t)}
        </button>
      ))}
    </div>
  );
}

export function fmt(v: number | null | undefined, d = 1): string {
  return v === null || v === undefined ? "—" : v.toFixed(d);
}
export function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}
