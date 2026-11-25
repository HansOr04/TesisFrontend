import { createFileRoute } from "@tanstack/react-router";
import { AssessmentDashboardPage } from "@/modules/assessment-core/presentation/pages/dashboard.page";

export const Route = createFileRoute("/_loggedin/assessments/dashboard")({
  component: AssessmentDashboardPage,
});
