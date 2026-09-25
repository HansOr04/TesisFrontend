import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { AssessmentDashboardPage } from "@/modules/assessment-core/presentation/pages/dashboard.page";

export const Route = createFileRoute(routeKeys.assessmentDashboard)({ component: AssessmentDashboardPage });
