import { IndicatorToolAdminPage } from "@/modules/indicator-tool/presentation/pages/indicator-tool-admin.page";
import { CAPACITY_TOOL_UI } from "../../domain/capacity-tool-ui";

export function CapacityTemplateAdminPage() {
  return <IndicatorToolAdminPage def={CAPACITY_TOOL_UI} />;
}
