import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/modules/analytics/presentation/pages/analytics.page";

export const Route = createFileRoute("/_loggedin/assessments/analytics")({
  component: AnalyticsPage,
});
