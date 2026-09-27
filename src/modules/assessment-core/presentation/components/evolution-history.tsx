import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LineChart } from "@/shared/components/line-chart";
import { gaugeColor } from "./gauge";
import type { Translate } from "@/shared/i18n/i18n";
import type { AssessmentEvaluationHistoryEntry } from "@/modules/assessment-core/infrastructure/assessment-api";

interface EvolutionHistoryProps {
  history: AssessmentEvaluationHistoryEntry[];
  t: Translate;
  /** "Dimensión", "Área" o "Principio", según la herramienta. */
  sectionLabel?: string;
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
      className="font-semibold"
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
 */
export function EvolutionHistory({
  history,
  t,
  sectionLabel,
}: EvolutionHistoryProps) {
  if (history.length === 0) return null;

  // El orden del backend no está garantizado y aquí la cronología es el eje
  // de toda la lectura, así que se ordena antes de recortar.
  const ordered = [...history].sort((a, b) => {
    const at = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return at - bt;
  });
  const shown = ordered.slice(-MAX_COLUMNS);
  const latest = shown[shown.length - 1];
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
    value: Number(h.globalScore.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle
          className="text-base"
          style={{ color: "var(--color-brand)" }}
        >
          {t("app.assessment.history.title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {shown.length > 1
            ? t("app.assessment.history.subtitle", { count: shown.length })
            : t("app.assessment.history.subtitleSingle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {shown.length > 1 && (
          <LineChart chartData={chartData} lineType="linear" showValues />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="text-left py-2 px-4">
                  {sectionLabel ?? t("app.assessment.history.colSection")}
                </th>
                {shown.map((h) => (
                  <th
                    key={h.evaluationId}
                    scope="col"
                    className="text-center py-2 px-4 whitespace-nowrap"
                  >
                    {formatDate(h.completedAt)}
                  </th>
                ))}
                {previous && (
                  <th scope="col" className="text-center py-2 px-4">
                    {t("app.assessment.history.colDelta")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t bg-muted/30 font-semibold">
                <td className="py-2 px-4">
                  {t("app.assessment.history.rowGlobal")}
                </td>
                {shown.map((h) => (
                  <td
                    key={h.evaluationId}
                    className="text-center py-2 px-4"
                    style={{ color: gaugeColor(h.globalScore) }}
                  >
                    {h.globalScore.toFixed(1)}
                  </td>
                ))}
                {previous && (
                  <td className="text-center py-2 px-4">
                    <Delta
                      value={
                        round1(latest.globalScore) -
                        round1(previous.globalScore)
                      }
                    />
                  </td>
                )}
              </tr>

              {rows.map(([number, name]) => {
                const current = scoreAt(latest, number);
                const before = previous ? scoreAt(previous, number) : null;
                return (
                  <tr key={number} className="border-t">
                    <td className="py-2 px-4">
                      {number}. {name}
                    </td>
                    {shown.map((h) => {
                      const score = scoreAt(h, number);
                      return (
                        <td
                          key={h.evaluationId}
                          className="text-center py-2 px-4"
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
                      <td className="text-center py-2 px-4">
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

              <tr className="border-t">
                <td className="py-2 px-4 text-muted-foreground">
                  {t("app.assessment.history.rowMeasures")}
                </td>
                {shown.map((h) => (
                  <td
                    key={h.evaluationId}
                    className="text-center py-2 px-4 text-muted-foreground"
                  >
                    {h.measuresDone} / {h.measuresTotal}
                  </td>
                ))}
                {previous && <td />}
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
      </CardContent>
    </Card>
  );
}
