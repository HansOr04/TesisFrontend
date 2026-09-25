import { routeKeys } from "@/shared/config/route-keys";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { PageTitle } from "@/shared/components/page-title";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  ArrowLeft,
  AlertTriangle,
  Building2,
  Clock,
  Globe,
  Plus,
  Users,
} from "lucide-react";
import { createOrganizationalEvaluation } from "@/modules/organizational-tool/infrastructure/organizational-api";
import {
  fetchAssessmentAssociationOverview,
  fetchAssessmentProfiles,
  updateAssessmentProfile,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import type {
  AssessmentAssociationOverview,
  AssessmentOrganisationProfile,
  AssessmentProfileChildToolScore,
  AssessmentProfileToolScores,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import { gaugeColor } from "@/modules/assessment-core/presentation/components/gauge";
import { cn } from "@/shared/lib/utils";

const TOOLS: {
  key: keyof AssessmentProfileToolScores;
  label: string;
  titleKey: string;
}[] = [
  {
    key: "organizational",
    label: "Organizational",
    titleKey: "app.assessment.organizational.title",
  },
];

function companyAverage(row: AssessmentProfileToolScores): number | null {
  const scores = TOOLS.map(({ key }) => row[key]?.globalScore).filter(
    (s): s is number => s !== null && s !== undefined
  );
  return scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function ScoreBadge({
  score,
  onClick,
  onStart,
  starting,
  emptyLabel,
  startLabel,
}: {
  score: AssessmentProfileChildToolScore | null;
  onClick?: () => void;
  onStart?: () => void;
  starting?: boolean;
  emptyLabel: string;
  startLabel: string;
}) {
  if (!score || score.globalScore === null) {
    if (!onStart) {
      return (
        <span className="text-xs text-muted-foreground">{emptyLabel}</span>
      );
    }
    return (
      <button
        type="button"
        className="text-xs font-semibold underline-offset-2 hover:underline disabled:opacity-50"
        style={{ color: "var(--color-brand)" }}
        onClick={onStart}
        disabled={starting}
        title={startLabel}
      >
        {starting ? "…" : startLabel}
      </button>
    );
  }
  const color = gaugeColor(score.globalScore);
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-white",
        onClick && "cursor-pointer"
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
      disabled={!onClick}
    >
      {score.globalScore.toFixed(1)}
    </button>
  );
}

export function AssociationDetailPage() {
  const { profileId } = useParams({
    from: routeKeys.assessmentAssociationDetail,
  });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate({
    from: "/assessments/associations/$profileId",
  });

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const [overview, setOverview] =
    useState<AssessmentAssociationOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddExisting, setShowAddExisting] = useState(false);
  const [candidates, setCandidates] = useState<AssessmentOrganisationProfile[]>(
    []
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [linking, setLinking] = useState(false);
  const [startingKey, setStartingKey] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    if (!org || !token) return;
    setLoading(true);
    try {
      const refreshedToken = token;
      const data = await fetchAssessmentAssociationOverview(
        org,
        profileId,
        refreshedToken
      );
      setOverview(data);
    } catch (err: unknown) {
      console.error("Failed to load association overview", err);
    } finally {
      setLoading(false);
    }
  }, [org, token, profileId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const goToSummary = (
    tool: keyof AssessmentProfileToolScores,
    score: AssessmentProfileChildToolScore | null
  ) => {
    if (!score) return;
    void tool;
    void navigate({ to: "/assessments" });
  };

  const handleStartEvaluation = async (
    childProfileId: string,
    tool: keyof AssessmentProfileToolScores
  ) => {
    if (!org || !token) return;
    const key = `${childProfileId}:${tool}`;
    setStartingKey(key);
    try {
      const refreshedToken = token;
      const createFn = createOrganizationalEvaluation;
      await createFn(org, { profileId: childProfileId }, refreshedToken);
      void navigate({ to: "/assessments" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setStartingKey(null);
    }
  };

  const consolidatedFallback = useCallback(
    (tool: keyof AssessmentProfileToolScores): number | null => {
      if (!overview) return null;
      const scores = overview.children
        .map((c) => c[tool]?.globalScore)
        .filter((s): s is number => s !== null && s !== undefined);
      return scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : null;
    },
    [overview]
  );

  const memberStats = useMemo(() => {
    if (!overview) return { total: 0, avgScore: null, critical: 0, pending: 0 };
    const total = overview.children.length;
    let critical = 0;
    let pending = 0;
    const allScores: number[] = [];
    for (const child of overview.children) {
      const scores = TOOLS.map(({ key }) => child[key]?.globalScore).filter(
        (s): s is number => s !== null && s !== undefined
      );
      if (scores.length === 0) {
        pending++;
      } else {
        allScores.push(...scores);
        if (scores.some((s) => s <= 5)) critical++;
      }
    }
    const avgScore =
      allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        : null;
    return { total, avgScore, critical, pending };
  }, [overview]);

  const distribution = useMemo(() => {
    if (!overview) return { critical: 0, medium: 0, good: 0 };
    let critical = 0;
    let medium = 0;
    let good = 0;
    for (const child of overview.children) {
      const avg = companyAverage(child);
      if (avg === null) continue;
      if (avg <= 5) critical++;
      else if (avg < 7) medium++;
      else good++;
    }
    return { critical, medium, good };
  }, [overview]);

  const distributionTotal =
    distribution.critical + distribution.medium + distribution.good;

  const linkedIds = useMemo(() => {
    if (!overview) return new Set<string>();
    const ids = new Set(overview.children.map((c) => c.profile.id));
    ids.add(overview.profile.id);
    return ids;
  }, [overview]);

  const openAddExisting = useCallback(async () => {
    if (!org || !token) return;
    setShowAddExisting(true);
    setSelectedCandidateId("");
    try {
      const refreshedToken = token;
      const profiles = await fetchAssessmentProfiles(org, refreshedToken);
      setCandidates(
        profiles.filter(
          (p) =>
            !linkedIds.has(p.id) &&
            !p.parentProfileId &&
            !(p.type === "ASSOCIATION" && p.associationLevel === "LEVEL_2")
        )
      );
    } catch (err: unknown) {
      console.error("Failed to load candidate organisations", err);
    }
  }, [org, token, linkedIds]);

  const handleLinkExisting = async () => {
    if (!org || !token || !selectedCandidateId) return;
    setLinking(true);
    try {
      const refreshedToken = token;
      await updateAssessmentProfile(
        org,
        selectedCandidateId,
        { parentProfileId: profileId },
        refreshedToken
      );
      setShowAddExisting(false);
      await loadOverview();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        {t("app.assessment.profiles.noProfiles")}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("app.common.back")}
            onClick={() => void navigate({ to: "/assessments" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <PageTitle rawTitle={overview.profile.name} />
            <p className="text-sm text-muted-foreground mt-1">
              {t("app.assessment.organizational.associationDetailTitle")}
            </p>
          </div>
        </div>
        <Button onClick={() => void openAddExisting()}>
          <Plus className="h-4 w-4 mr-1" />
          {t("app.assessment.organizational.associationAddExisting")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.associationStatMembers")}
              </div>
              <div className="text-lg font-bold mt-1">{memberStats.total}</div>
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
                {t("app.assessment.organizational.associationStatAvgScore")}
              </div>
              <div className="text-lg font-bold mt-1">
                {memberStats.avgScore != null
                  ? `${memberStats.avgScore.toFixed(1)}/10`
                  : "—"}
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
                {t("app.assessment.organizational.associationStatCritical")}
              </div>
              <div className="text-lg font-bold mt-1 text-danger">
                {memberStats.critical}
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
                {t("app.assessment.organizational.associationStatPending")}
              </div>
              <div className="text-lg font-bold mt-1">
                {memberStats.pending}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
              <Clock className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TOOLS.map(({ key, titleKey }) => {
          const score = overview.ownScores[key];
          const hasOwnScore = score?.globalScore != null;
          const fallback = hasOwnScore ? null : consolidatedFallback(key);
          const displayScore = hasOwnScore ? score!.globalScore : fallback;
          return (
            <Card
              key={key}
              className={
                hasOwnScore ? "cursor-pointer hover:border-primary" : undefined
              }
              onClick={() => hasOwnScore && goToSummary(key, score)}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs uppercase text-muted-foreground font-semibold">
                      {t(titleKey)}
                    </div>
                    {!hasOwnScore && fallback !== null && (
                      <span
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground"
                        title={t(
                          "app.assessment.organizational.consolidatedTooltip"
                        )}
                      >
                        {t("app.assessment.organizational.consolidatedLabel")}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {displayScore != null
                      ? `${displayScore.toFixed(1)}/10`
                      : t("app.assessment.panel.noEvaluation")}
                  </div>
                </div>
                <Building2
                  className="h-8 w-8"
                  style={{
                    color:
                      displayScore != null
                        ? gaugeColor(displayScore)
                        : "hsl(var(--muted-foreground))",
                  }}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">
              {t("app.assessment.organizational.associationMemberCompanies")}
            </p>
            <span className="ml-auto text-xs text-muted-foreground">
              {overview.children.length}
            </span>
          </div>
          {overview.children.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t("app.assessment.organizational.associationNoMembers")}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th scope="col" className="text-left py-2 px-4">
                    {t("app.assessment.panel.colOrganisation")}
                  </th>
                  {TOOLS.map(({ key, label }) => (
                    <th scope="col" key={key} className="text-center py-2 px-4">
                      {label}
                    </th>
                  ))}
                  <th scope="col" className="text-center py-2 px-4">
                    {t("app.assessment.organizational.associationAvgColumn")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {overview.children.map((row) => {
                  const avg = companyAverage(row);
                  const critical = avg !== null && avg <= 5;
                  return (
                    <tr
                      key={row.profile.id}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{
                              backgroundColor:
                                avg !== null
                                  ? gaugeColor(avg)
                                  : "hsl(var(--muted-foreground))",
                            }}
                          >
                            {initials(row.profile.name).toUpperCase()}
                          </div>
                          <div>
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
                            <div className="text-xs italic text-muted-foreground">
                              {row.profile.mainProduct}
                            </div>
                          </div>
                        </div>
                      </td>
                      {TOOLS.map(({ key }) => (
                        <td key={key} className="text-center py-2.5 px-4">
                          <ScoreBadge
                            score={row[key]}
                            onClick={
                              row[key]
                                ? () => goToSummary(key, row[key])
                                : undefined
                            }
                            onStart={() =>
                              void handleStartEvaluation(row.profile.id, key)
                            }
                            starting={
                              startingKey === `${row.profile.id}:${key}`
                            }
                            emptyLabel={t("app.assessment.panel.noEvaluation")}
                            startLabel={t(
                              "app.assessment.panel.viewEvaluation"
                            )}
                          />
                        </td>
                      ))}
                      <td className="text-center py-2.5 px-4">
                        {avg !== null ? (
                          <span
                            className="font-bold text-sm"
                            style={{ color: gaugeColor(avg) }}
                          >
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

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

      <Dialog open={showAddExisting} onOpenChange={setShowAddExisting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-brand)" }}>
              {t("app.assessment.organizational.associationAddExisting")}
            </DialogTitle>
            <DialogDescription>
              {t("app.assessment.organizational.associationSelectToAdd")}
            </DialogDescription>
          </DialogHeader>
          <Select
            value={selectedCandidateId}
            onValueChange={setSelectedCandidateId}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddExisting(false);
              }}
            >
              {t("app.common.cancel")}
            </Button>
            <Button
              onClick={() => void handleLinkExisting()}
              disabled={linking || !selectedCandidateId}
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {t("app.assessment.organizational.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
