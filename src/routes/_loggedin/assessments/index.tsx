import { createFileRoute } from "@tanstack/react-router";
import { AssessmentProfilesPage } from "@/modules/assessment-core/presentation/pages/home.page";

export const Route = createFileRoute("/_loggedin/assessments/")({
  component: AssessmentProfilesPage,
});
