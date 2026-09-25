import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { AnalyticsPage } from "@/modules/analytics/presentation/pages/analytics.page";

export const Route = createFileRoute(routeKeys.assessmentAnalytics)({ component: AnalyticsPage });
