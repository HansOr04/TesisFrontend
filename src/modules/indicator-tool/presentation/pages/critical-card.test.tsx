import type { ComponentType } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/shared/i18n/i18n";
import { RiskPanelGeneralPage } from "@/modules/risk-tool/presentation/pages/risk-list.page";
import type { IndicatorToolUi } from "../../domain/indicator-tool-ui";
import { IndicatorToolListPage } from "./indicator-tool-list.page";

const { queries } = vi.hoisted(() => ({
  queries: {
    overview: () => ({
      queryKey: ["overview"],
      queryFn: () =>
        Promise.resolve({
          totalOrganisations: 2,
          activeEvaluations: 1,
          totalCritical: 7,
          overallCompliancePct: 55,
          organisations: [],
        }),
    }),
  },
}));

// Sin red: los clientes HTTP no intervienen en lo que se prueba.
vi.mock("@/modules/assessment-core/infrastructure/assessment-api", () => ({
  exportAssessmentDashboard: vi.fn(),
}));
vi.mock("@/modules/risk-tool/infrastructure/risk-api", () => ({
  createRiskEvaluation: vi.fn(),
}));
vi.mock("@/modules/risk-tool/application/risk-queries", () => ({
  riskQueries: queries,
}));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/modules/auth/application/auth-context", () => ({
  useAuth: () => ({
    organisations: { current: "mh" },
    currentUser: { accessToken: "token" },
    canAdminister: false,
    isReadOnly: true,
  }),
}));

const toolUi = (slug: IndicatorToolUi["slug"]) =>
  ({
    slug,
    i18n: `app.assessment.${slug}`,
    queries,
    sectionCount: 6,
    routes: {},
  }) as unknown as IndicatorToolUi;

const cases: [string, ComponentType, string][] = [
  [
    "organizational",
    () => <IndicatorToolListPage def={toolUi("organizational")} />,
    "Dimensiones Críticas",
  ],
  [
    "capacity",
    () => <IndicatorToolListPage def={toolUi("capacity")} />,
    "Áreas Críticas",
  ],
  ["risk", RiskPanelGeneralPage, "Riesgos Críticos sin Medida"],
];

// La tarjeta roja debe nombrar lo mismo que cuenta el servidor en cada
// herramienta: dimensiones, áreas o riesgos que siguen sin medida.
describe("critical card of the tool lists", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each(cases)("%s", async (_tool, Page, label) => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <I18nProvider>
          <Page />
        </I18nProvider>
      </QueryClientProvider>
    );
    expect(await screen.findByText("7")).toBeInTheDocument();
    expect(screen.getByText(label).parentElement).toHaveTextContent(
      `${label}7`
    );
  });
});
