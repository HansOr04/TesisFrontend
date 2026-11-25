import { createFileRoute } from "@tanstack/react-router";
import { AssociationDetailPage } from "@/modules/assessment-core/presentation/pages/associations-profileId.page";

export const Route = createFileRoute(
  "/_loggedin/assessments/associations/$profileId"
)({
  component: AssociationDetailPage,
});
