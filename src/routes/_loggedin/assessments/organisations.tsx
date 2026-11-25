import { createFileRoute } from "@tanstack/react-router";
import { OrganisationsPage } from "@/modules/auth/presentation/organisations/organisations.page";

export const Route = createFileRoute("/_loggedin/assessments/organisations")({
  component: OrganisationsPage,
});
