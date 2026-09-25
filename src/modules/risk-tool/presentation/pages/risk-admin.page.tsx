import { useNavigate } from "@tanstack/react-router";
import { RiskCountryParamsCard } from "../components/risk-country-params-card";
import { AssessmentTemplateAdmin } from "@/modules/assessment-core/presentation/components/template-admin";
import {
  fetchRiskTemplates,
  createRiskSection,
  updateRiskSection,
  deleteRiskSection,
  createRiskIndicator,
  updateRiskIndicator,
  deleteRiskIndicator,
} from "@/modules/risk-tool/infrastructure/risk-api";

export function RiskTemplateAdminPage() {
  const navigate = useNavigate({ from: "/assessments/risk/admin" });

  return (
    <div className="space-y-8">
      <AssessmentTemplateAdmin
        toolTitle="Herramienta de Riesgos"
        sectionLabel="Principio"
        onBack={() => void navigate({ to: "/assessments/risk" })}
        fetchTemplates={fetchRiskTemplates}
        createSection={createRiskSection}
        updateSection={updateRiskSection}
        deleteSection={deleteRiskSection}
        createIndicator={createRiskIndicator}
        updateIndicator={updateRiskIndicator}
        deleteIndicator={deleteRiskIndicator}
      />
      <RiskCountryParamsCard />
    </div>
  );
}
