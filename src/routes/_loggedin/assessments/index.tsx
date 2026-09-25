import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { AssessmentProfilesPage } from "@/modules/assessment-core/presentation/pages/home.page";

export const Route = createFileRoute(routeKeys.assessment)({ component: AssessmentProfilesPage });
