import { IndicatorToolListPage } from "@/modules/indicator-tool/presentation/pages/indicator-tool-list.page";
import { ORGANIZATIONAL_TOOL_UI } from "../../domain/organizational-tool-ui";

export function OrganizationalPanelGeneralPage() {
  return <IndicatorToolListPage def={ORGANIZATIONAL_TOOL_UI} />;
}
