import { IndicatorToolAdminPage } from "@/modules/indicator-tool/presentation/pages/indicator-tool-admin.page";
import { ORGANIZATIONAL_TOOL_UI } from "../../domain/organizational-tool-ui";

export function OrganizationalTemplateAdminPage() {
  return <IndicatorToolAdminPage def={ORGANIZATIONAL_TOOL_UI} />;
}
