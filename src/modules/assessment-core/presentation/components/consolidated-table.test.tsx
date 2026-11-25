import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConsolidatedTable } from "./consolidated-table";
import type {
  AssessmentDashboardRow,
  AssessmentEvaluationStatus,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import en from "@/shared/i18n/en.json";
import es from "@/shared/i18n/es.json";

const DICTS: Record<"es" | "en", Record<string, string>> = { es, en };

const row = (status: AssessmentEvaluationStatus) =>
  ({
    profile: { id: "p1", name: "Asociación Tungurahua", country: "EC" },
    organizational: {
      evaluationId: "e1",
      status,
      globalScore: 6.4,
      startedAt: "2026-11-25T00:00:00.000Z",
      criticalAlertCount: 0,
    },
    capacity: null,
    risk: null,
    criticalAlertCount: 0,
  }) as unknown as AssessmentDashboardRow;

// Panel Consolidado: el estado de cada evaluación se lee traducido.
describe("ConsolidatedTable, evaluation status", () => {
  it.each([
    ["es", "DRAFT", "Borrador"],
    ["es", "IN_PROGRESS", "En Progreso"],
    ["es", "COMPLETED", "Completada"],
    ["es", "ARCHIVED", "Archivada"],
    ["en", "DRAFT", "Draft"],
    ["en", "IN_PROGRESS", "In Progress"],
    ["en", "COMPLETED", "Completed"],
    ["en", "ARCHIVED", "Archived"],
  ] as const)("in %s shows %s as «%s»", (locale, status, label) => {
    render(
      <ConsolidatedTable
        rows={[row(status)]}
        t={(key) => DICTS[locale][key] ?? key}
        onOpenEvaluation={vi.fn()}
      />
    );
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByText(status)).not.toBeInTheDocument();
  });
});
