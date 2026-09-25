import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { coreQueries } from "@/modules/assessment-core/application/core-queries";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { PageTitle } from "@/shared/components/page-title";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Plus,
  ClipboardCheck,
  UserCog,
  Lock,
  SlidersHorizontal,
} from "lucide-react";
import type { AssessmentOrganisationProfile } from "@/modules/assessment-core/infrastructure/assessment-api";
import { ApplicabilityDialog } from "@/modules/assessment-core/presentation/components/applicability-dialog";
import { AssignEvaluatorDialog } from "@/modules/assessment-core/presentation/components/assign-evaluator-dialog";

export function AssessmentProfilesPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate({ from: "/assessments/" });

  const org = auth.organisations?.current;

  const queryClient = useQueryClient();
  const profilesQuery = useQuery(coreQueries.profiles(org));
  const profiles: AssessmentOrganisationProfile[] = profilesQuery.data ?? [];
  const loading = profilesQuery.isLoading;
  const [applicabilityProfile, setApplicabilityProfile] =
    useState<AssessmentOrganisationProfile | null>(null);
  const [assigningProfile, setAssigningProfile] =
    useState<AssessmentOrganisationProfile | null>(null);

  const loadProfiles = useCallback(async () => {
    if (!org) return;
    await coreQueries.invalidateProfiles(queryClient, org);
  }, [queryClient, org]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle rawTitle={t("app.assessment.profiles.title")} />
          <p className="text-sm text-muted-foreground mt-1">
            {t("app.assessment.profiles.subtitle")}
          </p>
        </div>
        <Button onClick={() => void navigate({ to: "/assessments/new" })}>
          <Plus className="h-4 w-4 mr-1" />
          {t("app.assessment.profiles.newProfile")}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : profiles.length === 0 ? (
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
                <th scope="col" className="text-right py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      {p.name}
                      {p.confidential && (
                        <Lock
                          className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                          aria-label={t(
                            "app.assessment.profiles.confidentialLabel"
                          )}
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">
                      {p.type === "ASSOCIATION"
                        ? t("app.assessment.profiles.typeAssociation")
                        : t("app.assessment.profiles.typeCompany")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {p.country}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {p.mainProduct}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        title={t(
                          "app.assessment.profiles.assignEvaluatorTitle"
                        )}
                        onClick={() => setAssigningProfile(p)}
                      >
                        <UserCog className="h-4 w-4" />
                        {t("app.assessment.profiles.assignEvaluatorAction")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title={t("app.assessment.profiles.applicabilityTitle")}
                        onClick={() => setApplicabilityProfile(p)}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        KPI aplicables
                      </Button>
                      <Button
                        size="sm"
                        className="bg-tool-organizational/10 text-tool-organizational shadow-none hover:bg-tool-organizational hover:text-white"
                        onClick={() => void navigate({ to: "/assessments/organizational" })}
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Organizativa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApplicabilityDialog
        profile={applicabilityProfile}
        open={applicabilityProfile !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setApplicabilityProfile(null);
        }}
      />

      {assigningProfile && org && (
        <AssignEvaluatorDialog
          organisation={org}
          profile={assigningProfile}
          open={Boolean(assigningProfile)}
          onOpenChange={(isOpen) => {
            if (!isOpen) setAssigningProfile(null);
          }}
          onSaved={() => void loadProfiles()}
        />
      )}
    </div>
  );
}
