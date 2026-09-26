import { useNavigate } from "@tanstack/react-router";
import { Fragment, useCallback, useState } from "react";
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
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadProfiles = useCallback(async () => {
    if (!org) return;
    await coreQueries.invalidateProfiles(queryClient, org);
  }, [queryClient, org]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Asociaciones Nivel 2 agrupan otras organizaciones (Nivel 1 o empresas)
  // como miembros vía parentProfileId. Se muestran como acordeón para que se
  // vea de un vistazo qué organizaciones pertenecen a cuál asociación.
  const childrenByParent = new Map<string, AssessmentOrganisationProfile[]>();
  for (const p of profiles) {
    if (!p.parentProfileId) continue;
    const siblings = childrenByParent.get(p.parentProfileId) ?? [];
    siblings.push(p);
    childrenByParent.set(p.parentProfileId, siblings);
  }
  const topLevelProfiles = profiles.filter((p) => !p.parentProfileId);

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
              {topLevelProfiles.map((p) => {
                const children = childrenByParent.get(p.id) ?? [];
                const isExpandable = children.length > 0;
                const isExpanded = expandedIds.has(p.id);
                return (
                  <Fragment key={p.id}>
                    <tr className="border-t hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          {isExpandable && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(p.id)}
                              aria-label={
                                isExpanded
                                  ? t("app.assessment.profiles.collapseGroup")
                                  : t("app.assessment.profiles.expandGroup")
                              }
                              aria-expanded={isExpanded}
                              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted"
                            >
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded && "rotate-90"
                                )}
                              />
                            </button>
                          )}
                          {p.name}
                          {p.confidential && (
                            <Lock
                              className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                              aria-label={t(
                                "app.assessment.profiles.confidentialLabel"
                              )}
                            />
                          )}
                          {isExpandable && (
                            <Badge
                              variant="secondary"
                              className="gap-1 font-normal"
                            >
                              <Users className="h-3 w-3" />
                              {t("app.assessment.profiles.memberCountBadge", {
                                count: children.length,
                              })}
                            </Badge>
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
                            {t(
                              "app.assessment.profiles.assignEvaluatorAction"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title={t(
                              "app.assessment.profiles.applicabilityTitle"
                            )}
                            onClick={() => setApplicabilityProfile(p)}
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                            KPI aplicables
                          </Button>
                          <Button
                            size="sm"
                            className="bg-tool-organizational/10 text-tool-organizational shadow-none hover:bg-tool-organizational hover:text-white"
                            onClick={() =>
                              void navigate({
                                to: "/assessments/organizational",
                              })
                            }
                          >
                            <ClipboardCheck className="h-4 w-4" />
                            Organizativa
                          </Button>
                          <Button
                            size="sm"
                            className="bg-tool-capacity/10 text-tool-capacity shadow-none hover:bg-tool-capacity hover:text-white"
                            onClick={() =>
                              void navigate({ to: "/assessments/capacity" })
                            }
                          >
                            <ClipboardCheck className="h-4 w-4" />
                            Capacidades
                          </Button>
                          <Button
                            size="sm"
                            className="bg-tool-risk/10 text-tool-risk shadow-none hover:bg-tool-risk hover:text-white"
                            onClick={() =>
                              void navigate({ to: "/assessments/risk" })
                            }
                          >
                            <ClipboardCheck className="h-4 w-4" />
                            Riesgos
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {isExpandable &&
                      isExpanded &&
                      children.map((child) => (
                        <tr
                          key={child.id}
                          className="border-t bg-muted/20 hover:bg-muted/30"
                        >
                          <td className="py-2.5 px-4 pl-11 font-medium text-[13px]">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">↳</span>
                              {child.name}
                              {child.confidential && (
                                <Lock
                                  className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                                  aria-label={t(
                                    "app.assessment.profiles.confidentialLabel"
                                  )}
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge variant="secondary">
                              {child.type === "ASSOCIATION"
                                ? t("app.assessment.profiles.typeAssociation")
                                : t("app.assessment.profiles.typeCompany")}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-muted-foreground">
                            {child.country}
                          </td>
                          <td className="py-2.5 px-4 text-muted-foreground">
                            {child.mainProduct}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                title={t(
                                  "app.assessment.profiles.assignEvaluatorTitle"
                                )}
                                onClick={() => setAssigningProfile(child)}
                              >
                                <UserCog className="h-4 w-4" />
                                {t(
                                  "app.assessment.profiles.assignEvaluatorAction"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                title={t(
                                  "app.assessment.profiles.applicabilityTitle"
                                )}
                                onClick={() => setApplicabilityProfile(child)}
                              >
                                <SlidersHorizontal className="h-4 w-4" />
                                KPI aplicables
                              </Button>
                              <Button
                                size="sm"
                                className="bg-tool-organizational/10 text-tool-organizational shadow-none hover:bg-tool-organizational hover:text-white"
                                onClick={() =>
                                  void navigate({
                                    to: "/assessments/organizational",
                                  })
                                }
                              >
                                <ClipboardCheck className="h-4 w-4" />
                                Organizativa
                              </Button>
                              <Button
                                size="sm"
                                className="bg-tool-capacity/10 text-tool-capacity shadow-none hover:bg-tool-capacity hover:text-white"
                                onClick={() =>
                                  void navigate({
                                    to: "/assessments/capacity",
                                  })
                                }
                              >
                                <ClipboardCheck className="h-4 w-4" />
                                Capacidades
                              </Button>
                              <Button
                                size="sm"
                                className="bg-tool-risk/10 text-tool-risk shadow-none hover:bg-tool-risk hover:text-white"
                                onClick={() =>
                                  void navigate({ to: "/assessments/risk" })
                                }
                              >
                                <ClipboardCheck className="h-4 w-4" />
                                Riesgos
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                );
              })}
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
