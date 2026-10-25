import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { PageTitle } from "@/shared/components/page-title";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  fetchAllAssessmentProfilesForAdmin,
  type AssessmentAdminProfileRow,
} from "@/modules/assessment-core/infrastructure/assessment-api";

// RF-08: «Gestionar organizaciones» del Administrador de plataforma — lista
// las organizaciones Assessment de TODOS los clientes (no solo la organización
// activa en el selector), excluyendo las marcadas como confidenciales. El
// backend (RequireGlobalSuperAdmin) es la fuente real de verdad del acceso;
// esta página solo se enlaza en el menú para superadmins. Editar una
// organización cambia primero al proyecto al que pertenece, porque el
// formulario de edición trabaja sobre el proyecto activo.
export function AssessmentAdminGlobalPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const token = auth.currentUser?.accessToken;
  const navigate = useNavigate();
  const allowed = auth.organisations?.allowed ?? [];

  const editProfile = (organisation: string, profileId: string) => {
    if (auth.organisations?.current !== organisation) {
      auth.setCurrentOrganisation(organisation);
    }
    void navigate({
      to: "/assessments/$profileId/edit",
      params: { profileId },
    });
  };

  const [rows, setRows] = useState<AssessmentAdminProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const refreshedToken = token;
        const data = await fetchAllAssessmentProfilesForAdmin(refreshedToken);
        if (!cancelled) setRows(data);
      } catch (err: unknown) {
        console.error(
          "Failed to load cross-organisation Assessment profiles",
          err
        );
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <PageTitle rawTitle={t("app.assessment.adminGlobal.title")} />
        <p className="text-sm text-muted-foreground mt-1">
          {t("app.assessment.adminGlobal.subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-8 text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            {t("app.assessment.profiles.noProfiles")}
          </CardContent>
        </Card>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="text-left py-3 px-4">
                  {t("app.assessment.adminGlobal.colOrganisationClient")}
                </th>
                <th scope="col" className="text-left py-3 px-4">
                  {t("app.assessment.profiles.name")}
                </th>
                <th scope="col" className="text-left py-3 px-4">
                  {t("app.assessment.profiles.type")}
                </th>
                <th scope="col" className="text-left py-3 px-4">
                  {t("app.assessment.profiles.country")}
                </th>
                <th scope="col" className="text-left py-3 px-4">
                  {t("app.assessment.profiles.mainProduct")}
                </th>
                <th scope="col" className="py-3 px-4">
                  <span className="sr-only">
                    {t("app.assessment.wizard.edit")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ profile, organisationName }) => (
                <tr key={profile.id} className="border-t hover:bg-muted/30">
                  <td className="py-3 px-4 text-muted-foreground">
                    {organisationName}
                  </td>
                  <td className="py-3 px-4 font-medium">{profile.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">
                      {profile.type === "ASSOCIATION"
                        ? t("app.assessment.profiles.typeAssociation")
                        : t("app.assessment.profiles.typeCompany")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {profile.country}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {profile.mainProduct}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {allowed.includes(profile.organisation) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          editProfile(profile.organisation, profile.id)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        {t("app.assessment.wizard.edit")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
