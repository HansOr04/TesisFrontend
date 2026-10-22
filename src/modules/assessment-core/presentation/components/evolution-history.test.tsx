import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EvolutionHistory } from "./evolution-history";
import type { AssessmentEvaluationHistoryEntry } from "@/modules/assessment-core/infrastructure/assessment-api";

// El gráfico (recharts) necesita ResizeObserver, que jsdom no tiene; aquí
// solo importa la tabla.
vi.mock("@/shared/components/line-chart", () => ({ LineChart: () => null }));

const t = (key: string) => key;

const entry = (
  evaluationId: string,
  completedAt: string,
  globalScore: number
): AssessmentEvaluationHistoryEntry => ({
  evaluationId,
  completedAt,
  globalScore,
  sectionScores: [
    {
      sectionId: "s1",
      number: 1,
      name: "Capacidades y estrategias de personal",
      weight: 1,
      weightedAvg: globalScore,
      critical: false,
    },
  ],
  measuresTotal: 0,
  measuresDone: 0,
});

const history = [
  entry("e2", "2026-09-15T12:00:00.000Z", 7.9),
  entry("e1", "2025-11-15T12:00:00.000Z", 7.4),
];

// Historial comparativo: además de comparar dimensiones, cada corte se puede
// abrir para ver la nota que se puso a cada KPI ese día.
describe("EvolutionHistory, opening a past evaluation", () => {
  it("offers to open every other evaluation and marks the current one", () => {
    render(
      <EvolutionHistory
        history={history}
        t={t}
        currentEvaluationId="e2"
        onOpenEvaluation={vi.fn()}
      />
    );

    expect(
      screen.getByText("app.assessment.history.rowDetail")
    ).toBeInTheDocument();
    expect(screen.getAllByText("app.assessment.history.open")).toHaveLength(1);
    expect(
      screen.getByText("app.assessment.history.current")
    ).toBeInTheDocument();
  });

  it("passes the id of the chosen evaluation up", () => {
    const onOpenEvaluation = vi.fn();
    render(
      <EvolutionHistory
        history={history}
        t={t}
        currentEvaluationId="e2"
        onOpenEvaluation={onOpenEvaluation}
      />
    );

    fireEvent.click(screen.getByText("app.assessment.history.open"));

    expect(onOpenEvaluation).toHaveBeenCalledWith("e1");
  });

  it("hides the row when the page does not allow opening evaluations", () => {
    render(<EvolutionHistory history={history} t={t} />);

    expect(
      screen.queryByText("app.assessment.history.rowDetail")
    ).not.toBeInTheDocument();
  });
});
