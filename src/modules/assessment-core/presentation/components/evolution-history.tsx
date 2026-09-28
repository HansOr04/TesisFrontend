import { History, Loader2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { LineChart } from "@/shared/components/line-chart";
import { gaugeColor } from "./gauge";
import type { Translate } from "@/shared/i18n/i18n";
import type { AssessmentEvaluationHistoryEntry } from "@/modules/assessment-core/infrastructure/assessment-api";

interface EvolutionHistoryProps {
  history: AssessmentEvaluationHistoryEntry[];
  t: Translate;
  /** "Dimensión", "Área" o "Principio", según la herramienta. */
  sectionLabel?: string;
  /** Inicia un ciclo nuevo para la misma organización y herramienta. */
  onRetake?: () => void;
  retaking?: boolean;
}

// Más allá de seis cortes la tabla no cabe sin scroll horizontal incómodo;
// se muestran los más recientes, que son los que se comparan.
const MAX_COLUMNS = 6;

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

/**
 * Variación entre el último corte y el anterior. Se calcula sobre los
 * valores ya redondeados a un decimal, que son los que se ven en la tabla:
 * si no, una diferencia de 0,01 entre 7,04 y 7,05 se lee como "7.0 → 7.1"
 * con variación "=", que no cuadra.
 */
function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const rounded = Number(value.toFixed(1));
  if (rounded === 0) {
    return <span className="text-muted-foreground">=</span>;
  }
  const up = rounded > 0;
  return (
    <span
      className="font-semibold tabular-nums"
      style={{ color: up ? "var(--color-success)" : "var(--color-danger)" }}
    >
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {rounded.toFixed(1)}
    </span>
  );
}

/**
 * Historial de la organización en esta herramienta: cómo ha evolucionado el
 * puntaje global y, sobre todo, qué cambió en cada dimensión de un corte al
 * siguiente. Es solo lectura — para comparar, no para editar.
 *
 * Se muestra también cuando todavía no hay ningún corte cerrado: si
 * desapareciera, no habría forma de saber que el historial existe ni desde
 * dónde iniciar el siguiente ciclo.
 */
export function EvolutionHistory({
  history,
  t,
  sectionLabel,
  onRetake,
  retaking = false,
}: EvolutionHistoryProps) {
  // El orden del backend no está garantizado y aquí la cronología es el eje
  // de toda la lectura, así que se ordena antes de recortar.
  const ordered = [...history].sort((a, b) => {
    const at = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return at - bt;
  });
  const shown = ordered.slice(-MAX_COLUMNS);
  const latest = shown.at(-1);
  const previous = shown.length > 1 ? shown[shown.length - 2] : null;

  // Una fila por dimensión: se toman todas las que aparecen en algún corte,
  // con el nombre del más reciente (las plantillas se pueden renombrar).
  const sections = new Map<number, string>();
  for (const entry of shown) {
    for (const section of entry.sectionScores) {
      sections.set(section.number, section.name);
    }
  }
  const rows = [...sections.entries()].sort((a, b) => a[0] - b[0]);
  const round1 = (value: number): number => Number(value.toFixed(1));
  const scoreAt = (
    entry: AssessmentEvaluationHistoryEntry,
    number: number
  ): number | null => {
    const score = entry.sectionScores.find((s) => s.number === number);
    return score ? round1(score.weightedAvg) : null;
  };

  const chartData = shown.map((h) => ({
    key: formatDate(h.completedAt),
    value: round1(h.globalScore),
  }));

  const subtitle =
    shown.length === 0
      ? t("app.assessment.history.subtitleEmpty")
      : shown.length === 1
        ? t("app.assessment.history.subtitleSingle")
        : t("app.assessment.history.subtitle", { count: shown.length });

  // La columna del corte más reciente se resalta: es contra la que se
  // compara todo lo demás.
  const columnClass = (index: number) =>
    index === shown.length - 1 ? "bg-brand/5 font-semibold" : undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle
              className="flex items-center gap-2 text-base"
              style={{ color: "var(--color-brand)" }}
            >
              <History className="h-4 w-4" />
              {t("app.assessment.history.title")}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          {onRetake && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetake}
              disabled={retaking}
              className="shrink-0"
            >
              {retaking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {retaking
                ? t("app.assessment.history.retaking")
                : t("app.assessment.history.retake")}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {shown.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            {t("app.assessment.history.empty")}
          </p>
        ) : (
          <>
            {shown.length > 1 && (
              <LineChart chartData={chartData} lineType="linear" showValues />
            )}

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th
                      scope="col"
                      className="min-w-[220px] px-4 py-2.5 text-left font-semibold"
                    >
                      {sectionLabel ?? t("app.assessment.history.colSection")}
                    </th>
                    {shown.map((h, index) => (
                      <th
                        key={h.evaluationId}
                        scope="col"
                        className={`whitespace-nowrap px-4 py-2.5 text-center font-semibold ${columnClass(index) ?? ""}`}
                      >
                        {formatDate(h.completedAt)}
                      </th>
                    ))}
                    {previous && (
                      <th
                        scope="col"
                        className="whitespace-nowrap border-l border-border px-4 py-2.5 text-center font-semibold"
                      >
                        {t("app.assessment.history.colDelta")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border bg-muted/30">
                    <td className="px-4 py-2.5 font-bold">
                      {t("app.assessment.history.rowGlobal")}
                    </td>
                    {shown.map((h, index) => (
                      <td
                        key={h.evaluationId}
                        className={`px-4 py-2.5 text-center font-bold tabular-nums ${columnClass(index) ?? ""}`}
                        style={{ color: gaugeColor(h.globalScore) }}
                      >
                        {round1(h.globalScore).toFixed(1)}
                      </td>
                    ))}
                    {previous && latest && (
                      <td className="border-l border-border px-4 py-2.5 text-center">
                        <Delta
                          value={
                            round1(latest.globalScore) -
                            round1(previous.globalScore)
                          }
                        />
                      </td>
                    )}
                  </tr>

                  {rows.map(([number, name], rowIndex) => {
                    const current = latest ? scoreAt(latest, number) : null;
                    const before = previous ? scoreAt(previous, number) : null;
                    return (
                      <tr
                        key={number}
                        className={`border-t border-border ${rowIndex % 2 === 1 ? "bg-muted/20" : ""}`}
                      >
                        <td className="px-4 py-2.5">
                          <span className="text-muted-foreground">
                            {number}.
                          </span>{" "}
                          {name}
                        </td>
                        {shown.map((h, index) => {
                          const score = scoreAt(h, number);
                          return (
                            <td
                              key={h.evaluationId}
                              className={`px-4 py-2.5 text-center tabular-nums ${columnClass(index) ?? ""}`}
                              style={
                                score === null
                                  ? undefined
                                  : { color: gaugeColor(score) }
                              }
                            >
                              {score === null ? "—" : score.toFixed(1)}
                            </td>
                          );
                        })}
                        {previous && (
                          <td className="border-l border-border px-4 py-2.5 text-center">
                            <Delta
                              value={
                                current === null || before === null
                                  ? null
                                  : current - before
                              }
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  <tr className="border-t border-border">
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {t("app.assessment.history.rowMeasures")}
                    </td>
                    {shown.map((h, index) => (
                      <td
                        key={h.evaluationId}
                        className={`px-4 py-2.5 text-center tabular-nums text-muted-foreground ${columnClass(index) ?? ""}`}
                      >
                        {h.measuresDone} / {h.measuresTotal}
                      </td>
                    ))}
                    {previous && <td className="border-l border-border" />}
                  </tr>
                </tbody>
              </table>
            </div>

            {ordered.length > shown.length && (
              <p className="text-xs text-muted-foreground">
                {t("app.assessment.history.truncated", {
                  shown: shown.length,
                  total: ordered.length,
                })}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
