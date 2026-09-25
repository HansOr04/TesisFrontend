import { SCORE_COLORS } from "@/shared/design/score-colors";
import { useTranslation } from "@/shared/i18n/i18n";
import type { AssessmentGanttItem } from "@/modules/assessment-core/infrastructure/assessment-api";

// Cronograma de mitigación/acción (RF-06, luego rediseñado): barra horizontal por
// medida, posicionada por CSS (offset%/ancho% dentro del rango total de fechas) —
// sin librería de gráficos, mismo criterio de "SVG/CSS propio" ya usado en gauge.tsx.
//
// El color de cada barra refleja el CUMPLIMIENTO DE PLAZO, no el % de avance ni el
// status crudo: risk = completada, rojo = plazo vencido sin completar (atrasada),
// ámbar = en curso/pendiente pero todavía dentro de plazo. Mismos hex que gauge.tsx
// para mantener el mismo lenguaje visual que los badges de puntaje KPI.
const RED = SCORE_COLORS.critical;
const YELLOW = SCORE_COLORS.medium;
const GREEN = SCORE_COLORS.high;

function scheduleColor(item: AssessmentGanttItem, nowMs: number): string {
  if (item.status === "DONE") return GREEN;
  const endMs = new Date(item.end).getTime();
  return nowMs > endMs ? RED : YELLOW;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // semana empieza en lunes
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const weekOfMonth = Math.ceil(date.getDate() / 7);
  return `${month} S${weekOfMonth}`;
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
  });
}

interface GanttChartProps {
  measures: AssessmentGanttItem[];
  statusLabel?: (status: string) => string;
  emptyLabel?: string;
  todayLabel?: string;
  overdueSuffix?: string;
  daysLeftSuffix?: string;
}

export function GanttChart({
  measures,
  statusLabel,
  emptyLabel,
  todayLabel: todayLabelProp,
  overdueSuffix: overdueSuffixProp,
  daysLeftSuffix: daysLeftSuffixProp,
}: GanttChartProps) {
  const { t } = useTranslation();
  const todayLabel = todayLabelProp ?? t("app.gantt.today");
  const overdueSuffix = overdueSuffixProp ?? t("app.gantt.overdue");
  const daysLeftSuffix = daysLeftSuffixProp ?? t("app.gantt.daysLeft");
  if (measures.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {emptyLabel ?? t("app.gantt.empty")}
      </div>
    );
  }

  const now = Date.now();
  const starts = [...measures.map((m) => new Date(m.start).getTime()), now];
  const ends = [...measures.map((m) => new Date(m.end).getTime()), now];
  const rangeStart = startOfWeek(new Date(Math.min(...starts)));
  const rangeEndRaw = new Date(Math.max(...ends));
  const rangeEnd = new Date(
    startOfWeek(rangeEndRaw).getTime() + 7 * MS_PER_DAY
  );
  const totalMs = Math.max(
    rangeEnd.getTime() - rangeStart.getTime(),
    MS_PER_DAY
  );

  const weeks: Date[] = [];
  let cursor = rangeStart.getTime();
  while (cursor < rangeEnd.getTime()) {
    weeks.push(new Date(cursor));
    cursor += 7 * MS_PER_DAY;
  }

  const pctFor = (date: Date) =>
    ((date.getTime() - rangeStart.getTime()) / totalMs) * 100;

  const todayPct = Math.min(Math.max(pctFor(new Date(now)), 0), 100);

  return (
    <div className="space-y-3" data-testid="gantt-chart">
      <div className="relative">
        <div
          className="grid text-[11px] text-muted-foreground border-b pb-1"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
        >
          {weeks.map((w) => (
            <div key={w.toISOString()} className="text-center truncate">
              {formatWeekLabel(w)}
            </div>
          ))}
        </div>
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${todayPct}%` }}
        >
          <span className="text-[10px] font-semibold text-foreground/70 -translate-x-1/2 whitespace-nowrap">
            {todayLabel}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {measures.map((m) => {
          const left = pctFor(new Date(m.start));
          const width = Math.max(
            pctFor(new Date(m.end)) - left,
            2 // ancho mínimo visible
          );
          const color = scheduleColor(m, now);
          const endMs = new Date(m.end).getTime();
          const overdueDays =
            m.status !== "DONE" && now > endMs
              ? Math.ceil((now - endMs) / MS_PER_DAY)
              : 0;
          const daysLeft =
            m.status !== "DONE" && now <= endMs
              ? Math.ceil((endMs - now) / MS_PER_DAY)
              : 0;
          return (
            <div key={m.measureId} className="flex items-center gap-3">
              <div
                className="w-40 shrink-0 text-xs truncate"
                title={m.description}
              >
                {m.description}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="relative h-6 bg-muted rounded overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 w-px bg-foreground/40"
                    style={{ left: `${todayPct}%` }}
                  />
                  <div
                    className="absolute top-0 h-full rounded flex items-center justify-center text-[10px] font-semibold text-white"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: color,
                    }}
                    title={`${m.responsible} · ${m.progressPct}% · ${
                      statusLabel ? statusLabel(m.status) : m.status
                    }`}
                  >
                    {m.progressPct}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    {formatShortDate(m.start)} — {formatShortDate(m.end)}
                  </span>
                  {overdueDays > 0 ? (
                    <span className="font-semibold" style={{ color: RED }}>
                      {overdueDays}d {overdueSuffix}
                    </span>
                  ) : daysLeft > 0 ? (
                    <span>
                      {daysLeft}d {daysLeftSuffix}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="w-24 shrink-0 text-[11px] text-muted-foreground truncate">
                {m.responsible}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
