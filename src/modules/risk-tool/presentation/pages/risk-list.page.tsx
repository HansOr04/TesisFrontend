import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { PageTitle } from "@/shared/components/page-title";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Users,
  Users2,
  Globe,
  AlertTriangle,
  Clock,
  Pencil,
  FilePlus2,
} from "lucide-react";
import { createRiskEvaluation } from "@/modules/risk-tool/infrastructure/risk-api";
import { riskQueries } from "@/modules/risk-tool/application/risk-queries";
import { gaugeColor } from "@/modules/assessment-core/presentation/components/gauge";

export function RiskPanelGeneralPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate({ from: "/assessments/risk/" });

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const queryClient = useQueryClient();
  const { data: overview, isLoading: loading } = useQuery(
    riskQueries.overview(org)
  );
  const [startingProfileId, setStartingProfileId] = useState<string | null>(
    null
  );

  const handleOpenEvaluation = async (
    profileId: string,
    evaluationId: string | null
  ) => {
    if (evaluationId) {
      void navigate({
        to: "/assessments/risk/$evaluationId",
        params: { evaluationId },
      });
      return;
    }
    if (!org || !token) return;
    setStartingProfileId(profileId);
    try {
      const refreshedToken = token;
      const evaluation = await createRiskEvaluation(
        org,
        { profileId },
        refreshedToken
      );
      void riskQueries.invalidateAll(queryClient, org);
      void navigate({
        to: "/assessments/risk/$evaluationId",
        params: { evaluationId: evaluation.id },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setStartingProfileId(null);
    }
  };

  const handleStartNewEvaluation = async (profileId: string) => {
    if (!org || !token) return;
    if (!window.confirm(t("app.assessment.common.newEvaluationConfirm")))
      return;
    setStartingProfileId(profileId);
    try {
      const refreshedToken = token;
      const evaluation = await createRiskEvaluation(
        org,
        { profileId },
        refreshedToken
      );
      void riskQueries.invalidateAll(queryClient, org);
      void navigate({
        to: "/assessments/risk/$evaluationId",
        params: { evaluationId: evaluation.id },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setStartingProfileId(null);
    }
  };

  const distribution = useMemo(() => {
    if (!overview) return { critical: 0, medium: 0, good: 0 };
    let critical = 0;
    let medium = 0;
    let good = 0;
    for (const o of overview.organisations) {
      if (o.globalScore === null) continue;
      if (o.globalScore <= 5) critical++;
      else if (o.globalScore < 7) medium++;
      else good++;
    }
    return { critical, medium, good };
  }, [overview]);

  const distributionTotal =
    distribution.critical + distribution.medium + distribution.good;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <PageTitle rawTitle={t("app.assessment.risk.title")} />
          <p className="text-sm text-muted-foreground mt-1">
            {t("app.assessment.risk.subtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void navigate({ to: "/assessments/risk/admin" })}
        >
          <Pencil className="h-4 w-4 mr-1" />
          {t("app.assessment.admin.manageStructure")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.statOrganisations")}
              </div>
              <div className="text-lg font-bold mt-1">
                {overview?.totalOrganisations ?? 0}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
              <Users className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.panel.statCompliance")}
              </div>
              <div className="text-lg font-bold mt-1">
                {overview?.overallCompliancePct ?? 0}%
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
              <Globe className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-danger font-semibold">
                {t("app.assessment.risk.statCriticalRisks")}
              </div>
              <div className="text-lg font-bold mt-1 text-danger">
                {overview?.totalCritical ?? 0}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.statActive")}
              </div>
              <div className="text-lg font-bold mt-1">
                {overview?.activeEvaluations ?? 0}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
              <Clock className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : !overview || overview.organisations.length === 0 ? (
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
                  {t("app.assessment.panel.colOrganisation")}
                </th>
                {[1, 2, 3, 4].map((n) => (
                  <th scope="col" key={n} className="text-center py-3 px-2">
                    {t("app.assessment.risk.principle")} {n}
                  </th>
                ))}
                <th scope="col" className="text-center py-3 px-4">
                  {t("app.assessment.panel.colAction")}
                </th>
              </tr>
            </thead>
            <tbody>
              {overview.organisations.map((row) => {
                const critical =
                  row.globalScore !== null && row.globalScore <= 5;
                return (
                  <tr
                    key={row.profile.id}
                    className="border-t hover:bg-muted/30"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="font-semibold"
                          style={
                            critical
                              ? { color: "var(--color-danger)" }
                              : undefined
                          }
                        >
                          {row.profile.name}
                        </div>
                        {row.isConsolidated && (
                          <span
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground"
                            title={t(
                              "app.assessment.organizational.consolidatedTooltip"
                            )}
                          >
                            {t(
                              "app.assessment.organizational.consolidatedLabel"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-xs italic text-muted-foreground">
                        {row.profile.mainProduct}
                      </div>
                    </td>
                    {[1, 2, 3, 4].map((n) => {
                      const section = row.sectionScores.find(
                        (s) => s.number === n
                      );
                      const canNavigateEvaluation = section && row.evaluationId;
                      const canNavigateAssociation =
                        section && row.isConsolidated;
                      const canNavigate =
                        canNavigateEvaluation || canNavigateAssociation;
                      return (
                        <td
                          key={n}
                          className={
                            canNavigate
                              ? "text-center py-3 px-2 cursor-pointer hover:bg-muted/40"
                              : "text-center py-3 px-2"
                          }
                          title={
                            canNavigateEvaluation
                              ? t("app.assessment.panel.viewEvaluation")
                              : canNavigateAssociation
                                ? t(
                                    "app.assessment.organizational.associationViewLabel"
                                  )
                                : undefined
                          }
                          onClick={() => {
                            if (canNavigateEvaluation && row.evaluationId) {
                              void navigate({
                                to: "/assessments/risk/$evaluationId/summary",
                                params: { evaluationId: row.evaluationId },
                              });
                            } else if (canNavigateAssociation) {
                              void navigate({
                                to: "/assessments/associations/$profileId",
                                params: { profileId: row.profile.id },
                              });
                            }
                          }}
                        >
                          {section ? (
                            <>
                              <div className="font-bold text-sm">
                                {section.weightedAvg.toFixed(1)}
                              </div>
                              <div
                                className="h-2 w-2 rounded-full mx-auto mt-1"
                                style={{
                                  backgroundColor: gaugeColor(
                                    section.weightedAvg
                                  ),
                                }}
                              />
                            </>
                          ) : (
                            <span className="text-muted-foreground">
                              {t("app.assessment.panel.noEvaluation")}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {row.profile.type === "ASSOCIATION" &&
                          row.profile.associationLevel === "LEVEL_2" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t(
                                "app.assessment.organizational.associationViewLabel"
                              )}
                              onClick={() =>
                                void navigate({
                                  to: "/assessments/associations/$profileId",
                                  params: { profileId: row.profile.id },
                                })
                              }
                            >
                              <Users2 className="h-4 w-4" />
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("app.assessment.panel.viewEvaluation")}
                          disabled={startingProfileId === row.profile.id}
                          onClick={() =>
                            void handleOpenEvaluation(
                              row.profile.id,
                              row.evaluationId
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {row.evaluationId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              row.status === "DRAFT" ||
                              row.status === "IN_PROGRESS"
                                ? t(
                                    "app.assessment.common.newEvaluationBlocked"
                                  )
                                : t("app.assessment.risk.newEvaluation")
                            }
                            disabled={
                              startingProfileId === row.profile.id ||
                              row.status === "DRAFT" ||
                              row.status === "IN_PROGRESS"
                            }
                            onClick={() =>
                              void handleStartNewEvaluation(row.profile.id)
                            }
                          >
                            <FilePlus2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {distributionTotal > 0 && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <p className="text-sm font-semibold">
              {t("app.assessment.panel.statCompliance")}
            </p>
            {[
              {
                label: t("app.assessment.organizational.capacityHigh"),
                count: distribution.good,
                color: "var(--color-success)",
              },
              {
                label: t("app.assessment.organizational.capacityMedium"),
                count: distribution.medium,
                color: "var(--color-warning)",
              },
              {
                label: t("app.assessment.organizational.capacityLow"),
                count: distribution.critical,
                color: "var(--color-danger)",
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-16 text-xs text-muted-foreground shrink-0">
                  {row.label}
                </span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(row.count / distributionTotal) * 100}%`,
                      backgroundColor: row.color,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold w-6 text-right">
                  {row.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() => void navigate({ to: "/assessments/new" })}
        >
          {t("app.assessment.profiles.newProfile")}
        </Button>
      </div>
    </div>
  );
}
