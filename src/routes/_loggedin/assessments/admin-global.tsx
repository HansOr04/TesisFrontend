import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { AssessmentAdminGlobalPage } from "@/modules/assessment-core/presentation/pages/admin-global.page";

export const Route = createFileRoute(routeKeys.assessmentAdminGlobal)({ component: AssessmentAdminGlobalPage });
