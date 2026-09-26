import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { AssessmentProfileWizardPage } from "@/modules/assessment-core/presentation/pages/new.page";

export const Route = createFileRoute(routeKeys.assessmentNew)({
  component: AssessmentProfileWizardPage,
});
