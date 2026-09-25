import { IndicatorToolSectionPage } from "@/modules/indicator-tool/presentation/pages/indicator-tool-section.page";
import { ORGANIZATIONAL_TOOL_UI } from "../../domain/organizational-tool-ui";

export function OrganizationalDimensionAnalysisPage() {
  return <IndicatorToolSectionPage def={ORGANIZATIONAL_TOOL_UI} />;
}
