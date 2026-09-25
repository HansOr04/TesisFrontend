import { SCORE_COLORS } from "@/shared/design/score-colors";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Gauge, gaugeColor } from "./gauge";

describe("Gauge (FE3-B04)", () => {
  it("renders the value rounded to one decimal", () => {
    render(<Gauge value={7.456} label="Liderazgo y Talento Humano" />);
    expect(screen.getByTestId("gauge-value").textContent).toBe("7.5");
  });

  it("clamps out-of-range values to the 0-10 scale", () => {
    render(<Gauge value={15} label="Dim" />);
    expect(screen.getByTestId("gauge-value").textContent).toBe("10.0");
  });

  describe("gaugeColor thresholds", () => {
    it("is red (critical) at score <= 5", () => {
      expect(gaugeColor(5)).toBe(SCORE_COLORS.critical);
      expect(gaugeColor(0)).toBe(SCORE_COLORS.critical);
    });

    it("is yellow between 5 (exclusive) and 7 (exclusive)", () => {
      expect(gaugeColor(6.9)).toBe(SCORE_COLORS.medium);
    });

    it("is green at 7 and above", () => {
      expect(gaugeColor(7)).toBe(SCORE_COLORS.high);
      expect(gaugeColor(10)).toBe(SCORE_COLORS.high);
    });
  });
});
