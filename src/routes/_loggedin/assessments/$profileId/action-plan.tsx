import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { ProfileActionPlanPage } from "@/modules/assessment-core/presentation/pages/profile-action-plan.page";

export const Route = createFileRoute(routeKeys.assessmentProfileActionPlan)({
  component: ProfileActionPlanPage,
});
