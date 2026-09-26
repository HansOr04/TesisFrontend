import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { AssociationDetailPage } from "@/modules/assessment-core/presentation/pages/associations-profileId.page";

export const Route = createFileRoute(routeKeys.assessmentAssociationDetail)({
  component: AssociationDetailPage,
});
