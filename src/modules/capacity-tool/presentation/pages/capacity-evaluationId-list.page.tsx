import { IndicatorToolEvaluationPage } from "@/modules/indicator-tool/presentation/pages/indicator-tool-evaluation.page";
import { CAPACITY_TOOL_UI } from "../../domain/capacity-tool-ui";

export function CapacityEvaluationDetailPage() {
  return <IndicatorToolEvaluationPage def={CAPACITY_TOOL_UI} />;
}
