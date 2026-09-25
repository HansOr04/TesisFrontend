import { createFileRoute, Navigate } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { useAuth } from "@/modules/auth/application/auth-context";
import { AppShell } from "@/app/app-shell";
import { useTranslation } from "@/shared/i18n/i18n";

function LoggedInLayout() {
  const auth = useAuth();
  const { t } = useTranslation();
  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("app.shell.loadingSession")}
      </div>
    );
  }
  if (auth.status === "anonymous") {
    return <Navigate to="/login" />;
  }
  return <AppShell />;
}

export const Route = createFileRoute(routeKeys.loggedIn)({
  component: LoggedInLayout,
});
