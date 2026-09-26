import { createFileRoute, useParams } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { AssessmentProfileWizardPage } from "@/modules/assessment-core/presentation/pages/new.page";

function EditProfileRoute() {
  const { profileId } = useParams({ from: routeKeys.assessmentProfileEdit });
  return <AssessmentProfileWizardPage profileId={profileId} />;
}

export const Route = createFileRoute(routeKeys.assessmentProfileEdit)({
  component: EditProfileRoute,
});
