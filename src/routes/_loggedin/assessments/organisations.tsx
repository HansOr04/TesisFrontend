import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { OrganisationsPage } from "@/modules/auth/presentation/organisations/organisations.page";

export const Route = createFileRoute(routeKeys.assessmentOrganisations)({
  component: OrganisationsPage,
});
