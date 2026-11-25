import type { ReactNode } from "react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";

function NoAccess({ message }: { message: string }) {
  return (
    <div className="surface p-8 text-center text-muted-foreground">
      {message}
    </div>
  );
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { t } = useTranslation();
  if (!auth.canAdminister) {
    return <NoAccess message={t("app.common.onlyAdmin")} />;
  }
  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { t } = useTranslation();
  if (!auth.isActuallySuperAdmin) {
    return <NoAccess message={t("app.common.onlySuperAdmin")} />;
  }
  return <>{children}</>;
}
