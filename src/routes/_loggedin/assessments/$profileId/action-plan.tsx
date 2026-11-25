import { createFileRoute } from "@tanstack/react-router";
import { ProfileActionPlanPage } from "@/modules/assessment-core/presentation/pages/profile-action-plan.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/$profileId/action-plan"
)({
  component: ProfileActionPlanPage,
});
