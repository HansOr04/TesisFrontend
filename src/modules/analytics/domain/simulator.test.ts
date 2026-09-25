import { describe, expect, it } from "vitest";
import { marginalGain, simulate } from "./simulator";

const sections = [
  {
    number: 1,
    name: "A",
    weight: 1,
    indicators: [
      { id: "a1", code: "A1", name: "", weight: 1, score: 4 },
      { id: "a2", code: "A2", name: "", weight: 1, score: 6 },
    ],
  },
  {
    number: 2,
    name: "B",
    weight: 1,
    indicators: [{ id: "b1", code: "B1", name: "", weight: 2, score: 8 }],
  },
];

describe("simulator", () => {
  it("recomputes section and global scores with targets", () => {
    const base = simulate(sections, {});
    expect(base.sections[0].before).toBe(5);
    expect(base.globalScore).toBe(6.5);
    const sim = simulate(sections, { a1: 8 });
    expect(sim.sections[0].after).toBe(7);
    expect(sim.globalScore).toBe(7.5);
  });

  it("marginal gain reflects KPI and section weights", () => {
    expect(marginalGain(sections, "a1")).toBe(0.25);
    expect(marginalGain(sections, "b1")).toBe(0.5);
  });
});
