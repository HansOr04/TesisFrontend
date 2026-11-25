import { createFileRoute } from "@tanstack/react-router";
import { RequireAdmin } from "@/shared/components/require-role";
import { UsersPage } from "@/modules/auth/presentation/users/users.page";

export const Route = createFileRoute("/_loggedin/assessments/users")({
  component: () => (
    <RequireAdmin>
      <UsersPage />
    </RequireAdmin>
  ),
});
