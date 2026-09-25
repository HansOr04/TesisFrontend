import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/i18n/i18n";
import { AssessmentTemplateAdmin } from "@/modules/assessment-core/presentation/components/template-admin";
import type { IndicatorToolUi } from "../../domain/indicator-tool-ui";

export function IndicatorToolAdminPage({ def }: { def: IndicatorToolUi }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <AssessmentTemplateAdmin
      toolTitle={t(`${def.i18n}.title`)}
      sectionLabel={t(`${def.i18n}.section`)}
      onBack={() => void navigate({ to: def.routes.list })}
      fetchTemplates={def.api.fetchTemplates}
      createSection={def.api.createSection}
      updateSection={def.api.updateSection}
      deleteSection={def.api.deleteSection}
      createIndicator={def.api.createIndicator}
      updateIndicator={def.api.updateIndicator}
      deleteIndicator={def.api.deleteIndicator}
    />
  );
}
