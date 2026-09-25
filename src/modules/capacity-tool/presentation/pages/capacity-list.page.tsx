import { IndicatorToolListPage } from "@/modules/indicator-tool/presentation/pages/indicator-tool-list.page";
import { CAPACITY_TOOL_UI } from "../../domain/capacity-tool-ui";

export function CapacityPanelGeneralPage() {
  return <IndicatorToolListPage def={CAPACITY_TOOL_UI} />;
}
