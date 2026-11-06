import { describe, expect, it } from "vitest";
import { weightedSectionAverage } from "./section-average";

describe("weightedSectionAverage", () => {
  it("pondera cada KPI por su peso", () => {
    const indicators = [
      { id: "a", weight: 1 },
      { id: "b", weight: 3 },
    ];
    const scores = { a: { score: 4 }, b: { score: 8 } };
    expect(weightedSectionAverage(indicators, scores)).toBe(7);
  });

  it("acepta el peso como texto, como lo envía el servidor", () => {
    const indicators = [
      { id: "a", weight: "7" },
      { id: "b", weight: "9" },
    ] as unknown as { id: string; weight: number }[];
    const scores = { a: { score: 7 }, b: { score: 5 } };
    expect(weightedSectionAverage(indicators, scores)).toBeCloseTo(5.875);
  });

  it("ignora los KPI sin calificar y devuelve 0 si no hay ninguno", () => {
    const indicators = [
      { id: "a", weight: 2 },
      { id: "b", weight: 2 },
    ];
    expect(weightedSectionAverage(indicators, { a: { score: 6 } })).toBe(6);
    expect(weightedSectionAverage(indicators, { b: { score: null } })).toBe(0);
  });
});
