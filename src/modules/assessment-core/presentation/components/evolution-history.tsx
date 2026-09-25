import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LineChart } from "@/shared/components/line-chart";
import { gaugeColor } from "./gauge";
import type { AssessmentEvaluationHistoryEntry } from "@/modules/assessment-core/infrastructure/assessment-api";

interface EvolutionHistoryProps {
  history: AssessmentEvaluationHistoryEntry[];
  t: (key: string) => string;
}

// RF: ver cómo ha evolucionado la organización a través de varias
// evaluaciones completadas en el tiempo, junto con las medidas de
// mitigación resueltas en cada corte. Solo se muestra con 2+ evaluaciones
// completadas — con una sola no hay tendencia que graficar.
export function EvolutionHistory({ history, t }: EvolutionHistoryProps) {
  if (history.length < 2) return null;

  const chartData = history.map((h) => ({
    key: h.completedAt
      ? new Date(h.completedAt).toLocaleDateString("es-EC", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      : "—",
    value: Number(h.globalScore.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle
          className="text-base"
          style={{ color: "var(--color-brand)" }}
        >
          {t("app.assessment.organizational.evolutionTitle")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("app.assessment.organizational.evolutionSubtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <LineChart chartData={chartData} lineType="linear" showValues />
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th scope="col" className="text-left py-2 px-4">
                {t("app.assessment.organizational.evolutionColDate")}
              </th>
              <th scope="col" className="text-center py-2 px-4">
                {t("app.assessment.organizational.evolutionColScore")}
              </th>
              <th scope="col" className="text-center py-2 px-4">
                {t("app.assessment.organizational.evolutionColMeasures")}
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.evaluationId} className="border-t">
                <td className="py-2 px-4">
                  {h.completedAt
                    ? new Date(h.completedAt).toLocaleDateString("es-EC")
                    : "—"}
                </td>
                <td
                  className="text-center py-2 px-4 font-semibold"
                  style={{ color: gaugeColor(h.globalScore) }}
                >
                  {h.globalScore.toFixed(1)}
                </td>
                <td className="text-center py-2 px-4">
                  {h.measuresDone} / {h.measuresTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
