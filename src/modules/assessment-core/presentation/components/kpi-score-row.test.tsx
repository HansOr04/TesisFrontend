import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KpiScoreRow } from "./kpi-score-row";

const t = (key: string) => key;

describe("KpiScoreRow (FE3-B03)", () => {
  it("starts collapsed and expands on click", () => {
    render(
      <KpiScoreRow
        indicatorId="i1"
        number={1}
        code="AZ-1.1"
        name="KPI 1"
        score={null}
        observation=""
        t={t}
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByText("1")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("KPI 1"));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("calls onChange with the selected score, keeping the current observation", () => {
    const onChange = vi.fn();
    render(
      <KpiScoreRow
        indicatorId="i1"
        number={1}
        code="AZ-1.1"
        name="KPI 1"
        score={null}
        observation="obs previa"
        t={t}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByText("KPI 1"));
    fireEvent.click(screen.getByText("8"));

    expect(onChange).toHaveBeenCalledWith("i1", 8, "obs previa");
  });

  it("shows the observation warning only when a score is selected but no observation is set", () => {
    render(
      <KpiScoreRow
        indicatorId="i1"
        number={1}
        code="AZ-1.1"
        name="KPI 1"
        score={4}
        observation=""
        t={t}
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("KPI 1"));
    expect(
      screen.getByText("app.assessment.organizational.observationRequired")
    ).toBeInTheDocument();
  });

  it("does not show the warning once an observation is present", () => {
    render(
      <KpiScoreRow
        indicatorId="i1"
        number={1}
        code="AZ-1.1"
        name="KPI 1"
        score={4}
        observation="Justificación concreta"
        t={t}
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("KPI 1"));
    expect(
      screen.queryByText("app.assessment.organizational.observationRequired")
    ).not.toBeInTheDocument();
  });

  it("shows a colored score badge on the collapsed header once answered", () => {
    const { container } = render(
      <KpiScoreRow
        indicatorId="i1"
        number={1}
        code="AZ-1.1"
        name="KPI 1"
        score={9}
        observation="obs"
        t={t}
        onChange={vi.fn()}
      />
    );

    expect(container.querySelector(".rounded-full")?.textContent).toBe("9");
  });
});
