import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  MeasureProgressDialog,
  type MeasureProblem,
  type MeasureSolution,
} from "./measure-progress-dialog";

const t = (key: string) => key;

const problem: MeasureProblem = {
  code: "KPI 1.1",
  name: "Derechos de tenencia de la tierra asegurados",
  score: 3,
};

const solution = (patch: Partial<MeasureSolution> = {}): MeasureSolution => ({
  title: "Regularizar las escrituras de los socios",
  responsible: "Coordinador técnico",
  startDate: "2026-07-29",
  endDate: "2026-10-28",
  progressPct: 50,
  status: "IN_PROGRESS",
  ...patch,
});

const renderDialog = (s: MeasureSolution, onSave = vi.fn()) =>
  render(
    <MeasureProgressDialog
      open
      onOpenChange={vi.fn()}
      problem={problem}
      solution={s}
      saving={false}
      onSave={onSave}
      t={t}
    />
  );

// Seguimiento de una medida (RF-06): pasar a 100 % es concluirla, y una
// medida concluida tiene que decir qué se implementó.
describe("MeasureProgressDialog, concluding a measure", () => {
  it("does not let a measure be concluded without describing what was implemented", () => {
    const onSave = vi.fn();
    renderDialog(solution(), onSave);

    fireEvent.click(screen.getByRole("button", { name: "100%" }));

    expect(
      screen.getByText("app.assessment.measure.appliedImprovementsRequired")
    ).toBeInTheDocument();
    const save = screen.getByRole("button", {
      name: /app.assessment.measure.saveProgress/,
    });
    expect(save).toBeDisabled();
    fireEvent.click(save);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves the conclusion with what was implemented", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderDialog(solution(), onSave);

    fireEvent.click(screen.getByRole("button", { name: "100%" }));
    fireEvent.change(
      screen.getByPlaceholderText(
        "app.assessment.measure.appliedImprovementsDonePlaceholder"
      ),
      { target: { value: "Los 30 socios tienen escritura registrada." } }
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /app.assessment.measure.saveProgress/,
      })
    );

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        progressPct: 100,
        appliedImprovements: "Los 30 socios tienen escritura registrada.",
      })
    );
  });

  it("keeps partial progress optional to describe", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderDialog(solution({ progressPct: 0, status: "PENDING" }), onSave);

    fireEvent.click(screen.getByRole("button", { name: "25%" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: /app.assessment.measure.saveProgress/,
      })
    );

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ progressPct: 25 })
    );
  });
});
