import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DimensionView, type DraftResponse } from "./section-panel";
import type { AssessmentIndicatorData } from "@/modules/assessment-core/infrastructure/assessment-api";

const t = (key: string) => key;

const indicator = (
  id: string,
  code: string,
  name: string
): AssessmentIndicatorData => ({
  id,
  code,
  name,
  weight: 1,
  active: true,
  sortOrder: 0,
});

const indicators = [
  indicator("i1", "KPI 1.1", "Manual de funciones"),
  indicator("i2", "KPI 1.2", "Plan de capacitación"),
  indicator("i3", "KPI 1.3", "Evaluación del personal"),
];

// Formulario de calificación de una dimensión (HU-29): cada KPI con su fila,
// el contador de avance y el cambio de nota que sube a la página.
describe("DimensionView, scoring form of one dimension (HU-29)", () => {
  it("shows every KPI of the dimension and how many are already scored", () => {
    const responses: Record<string, DraftResponse> = {
      i1: {
        score: 7,
        observation: "Existe y está vigente",
        manualCritical: false,
      },
    };
    render(
      <DimensionView
        number={1}
        name="Capacidades y estrategias de personal"
        indicators={indicators}
        responses={responses}
        t={t}
        onChangeKpi={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Capacidades y estrategias de personal/)
    ).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    for (const ind of indicators) {
      expect(screen.getByText(ind.name)).toBeInTheDocument();
    }
  });

  it("passes the KPI id, the new score and the observation up when a score is chosen", () => {
    const onChangeKpi = vi.fn();
    render(
      <DimensionView
        number={1}
        name="Dimensión"
        indicators={indicators}
        responses={{
          i2: {
            score: null,
            observation: "Sin plan formal",
            manualCritical: false,
          },
        }}
        t={t}
        onChangeKpi={onChangeKpi}
      />
    );

    fireEvent.click(screen.getByText("Plan de capacitación"));
    fireEvent.click(screen.getByText("4"));

    expect(onChangeKpi).toHaveBeenCalledWith("i2", 4, "Sin plan formal", false);
  });

  it("uses the labels of the tool that reuses the form", () => {
    render(
      <DimensionView
        number={2}
        name="Disponibilidad de información"
        indicators={indicators}
        responses={{}}
        t={t}
        onChangeKpi={vi.fn()}
        labels={{ dimension: "Área", indicatorsCompleted: "indicadores" }}
      />
    );

    expect(
      screen.getByText(/Área 2: Disponibilidad de información/)
    ).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 3 indicadores/)).toBeInTheDocument();
  });
});
