import { createFileRoute } from "@tanstack/react-router";
import { AssessmentProfileWizardPage } from "@/modules/assessment-core/presentation/pages/new.page";

export const Route = createFileRoute("/_loggedin/assessments/new")({
  component: AssessmentProfileWizardPage,
});
