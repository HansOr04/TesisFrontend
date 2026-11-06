import type { ReactNode } from "react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";

// Pantallas de administración: el menú ya las esconde según el rol, pero
// alguien puede llegar por la dirección. El servidor rechaza sus acciones;
// aquí se evita mostrar formularios que no se pueden usar.

function NoAccess({ message }: { message: string }) {
  return (
    <div className="surface p-8 text-center text-muted-foreground">
      {message}
    </div>
  );
}

/** Administrador del proyecto (o superadministrador de la plataforma). */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { t } = useTranslation();
  if (!auth.canAdminister) {
    return <NoAccess message={t("app.common.onlyAdmin")} />;
  }
  return <>{children}</>;
}

/** Superadministrador de la plataforma. */
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { t } = useTranslation();
  if (!auth.isActuallySuperAdmin) {
    return <NoAccess message={t("app.common.onlySuperAdmin")} />;
  }
  return <>{children}</>;
}
