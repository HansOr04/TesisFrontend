import { routeKeys } from "@/shared/config/route-keys";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { useSetPageHeaderName } from "@/shared/components/page-header-context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ArrowLeft, ClipboardList, ExternalLink, Link2 } from "lucide-react";
import { coreQueries } from "@/modules/assessment-core/application/core-queries";
import type {
  AssessmentMeasureStatus,
  ProfileActionPlanMeasure,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import { RingGauge } from "@/modules/assessment-core/presentation/components/ring-gauge";
import { cn } from "@/shared/lib/utils";

type Tool = ProfileActionPlanMeasure["tool"];

const TOOLS: {
  tool: Tool;
  titleKey: string;
  stripe: string;
  planRoute:
    | "/assessments/organizational/$evaluationId/action-plan"
    | "/assessments/capacity/$evaluationId/action-plan"
    | "/assessments/risk/$evaluationId/mitigation";
}[] = [
  {
    tool: "ORGANIZATIONAL",
    titleKey: "app.assessment.organizational.title",
    stripe: "bg-tool-organizational",
    planRoute: "/assessments/organizational/$evaluationId/action-plan",
  },
  {
    tool: "CAPACITY",
    titleKey: "app.assessment.capacity.title",
    stripe: "bg-tool-capacity",
    planRoute: "/assessments/capacity/$evaluationId/action-plan",
  },
  {
    tool: "RISK",
    titleKey: "app.assessment.risk.title",
    stripe: "bg-tool-risk",
    planRoute: "/assessments/risk/$evaluationId/mitigation",
  },
];

const STATUS: Record<AssessmentMeasureStatus, { key: string; chip: string }> = {
  PENDING: {
    key: "app.assessment.measure.statusPending",
    chip: "bg-muted text-muted-foreground",
  },
  IN_PROGRESS: {
    key: "app.assessment.measure.statusInProgress",
    chip: "bg-warning/15 text-warning",
  },
  DONE: {
    key: "app.assessment.measure.statusDone",
    chip: "bg-success/12 text-success",
  },
};

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Plan de acción consolidado de una organización (pedido en el piloto, HU-57):
 * las medidas de las tres herramientas en una sola vista, agrupadas por
 * herramienta y por evaluación. Es de consulta; cada grupo enlaza al plan de
 * su herramienta, que es donde se registra el avance.
 */
export function ProfileActionPlanPage() {
  const { profileId } = useParams({
    from: routeKeys.assessmentProfileActionPlan,
  });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const org = auth.organisations?.current;

  const planQuery = useQuery(coreQueries.profileActionPlan(org, profileId));
  const plan = planQuery.data;
  useSetPageHeaderName(plan?.profile.name);

  const measures = useMemo(() => plan?.measures ?? [], [plan]);
  const counts = useMemo(
    () => ({
      PENDING: measures.filter((m) => m.status === "PENDING").length,
      IN_PROGRESS: measures.filter((m) => m.status === "IN_PROGRESS").length,
      DONE: measures.filter((m) => m.status === "DONE").length,
    }),
    [measures]
  );
  const averageProgress =
    measures.length === 0
      ? 0
      : measures.reduce((sum, m) => sum + m.progressPct, 0) /
        measures.length /
        10;

  // Por herramienta, y dentro de ella por evaluación (de la más reciente a la
  // más antigua): el backend ya entrega ese orden.
  const groups = useMemo(
    () =>
      TOOLS.map((def) => {
        const byEvaluation = new Map<string, ProfileActionPlanMeasure[]>();
        for (const m of measures.filter((x) => x.tool === def.tool)) {
          const list = byEvaluation.get(m.evaluationId) ?? [];
          list.push(m);
          byEvaluation.set(m.evaluationId, list);
        }
        return { def, evaluations: [...byEvaluation.entries()] };
      }),
    [measures]
  );

  if (planQuery.isLoading) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        {planQuery.error instanceof Error
          ? planQuery.error.message
          : t("app.assessment.profiles.noProfiles")}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
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
          <span
            className="text-lg font-bold"
            style={{ color: "var(--color-brand)" }}
          >
            {plan.profile.name}
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            — {t("app.assessment.profilePlan.title")}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("app.assessment.profilePlan.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {(
          [
            ["total", measures.length, "text-foreground"],
            ["DONE", counts.DONE, "text-success"],
            ["IN_PROGRESS", counts.IN_PROGRESS, "text-warning"],
            ["PENDING", counts.PENDING, "text-muted-foreground"],
          ] as const
        ).map(([key, value, color]) => (
          <Card key={key}>
            <CardContent className="py-4">
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {key === "total"
                  ? t("app.assessment.profilePlan.statTotal")
                  : t(STATUS[key].key)}
              </div>
              <div className={cn("text-2xl font-bold mt-1", color)}>
                {value}
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col items-center py-3">
            <RingGauge
              value={averageProgress}
              label={t("app.assessment.risk.statOverallProgress")}
              size={80}
            />
          </CardContent>
        </Card>
      </div>

      {measures.length === 0 && (
        <div className="text-center py-10 text-muted-foreground border rounded-2xl">
          <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
          {t("app.assessment.profilePlan.empty")}
        </div>
      )}

      {measures.length > 0 &&
        groups.map(({ def, evaluations }) => (
          <Card key={def.tool} className="overflow-hidden">
            <div className={cn("h-1.5 w-full", def.stripe)} />
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{t(def.titleKey)}</p>
                <span className="text-xs text-muted-foreground">
                  {t("app.assessment.profilePlan.measuresCount", {
                    count: evaluations.reduce(
                      (sum, [, list]) => sum + list.length,
                      0
                    ),
                  })}
                </span>
              </div>

              {evaluations.length === 0 ? (
                <p className="rounded-xl border border-dashed px-4 py-4 text-center text-xs text-muted-foreground">
                  {t("app.assessment.profilePlan.toolEmpty")}
                </p>
              ) : (
                evaluations.map(([evaluationId, list]) => (
                  <div key={evaluationId} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("app.assessment.profilePlan.evaluationOf", {
                          date: fmtDate(list[0].evaluationStartedAt),
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() =>
                          void navigate({
                            to: def.planRoute,
                            params: { evaluationId },
                          })
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("app.assessment.profilePlan.openToolPlan")}
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">
                              {t("app.assessment.profilePlan.colKpi")}
                            </th>
                            <th className="min-w-[220px] px-3 py-2 text-left font-semibold">
                              {t("app.assessment.profilePlan.colMeasure")}
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              {t(
                                "app.assessment.organizational.measureResponsible"
                              )}
                            </th>
                            <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                              {t("app.assessment.measure.period")}
                            </th>
                            <th className="px-3 py-2 text-center font-semibold">
                              {t("app.assessment.profilePlan.colStatus")}
                            </th>
                            <th className="min-w-[220px] px-3 py-2 text-left font-semibold">
                              {t("app.assessment.measure.cardImplemented")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((m, i) => (
                            <tr
                              key={m.id}
                              className={cn(
                                "border-t border-border align-top",
                                i % 2 === 1 && "bg-muted/20"
                              )}
                            >
                              <td className="px-3 py-2.5">
                                <span className="inline-block rounded bg-brand/5 border border-brand/20 text-brand-deep text-[11px] font-mono px-1.5 py-0.5">
                                  {m.indicatorCode}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <p className="font-medium leading-snug">
                                  {m.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {m.indicatorName}
                                </p>
                              </td>
                              <td className="px-3 py-2.5 text-muted-foreground">
                                {m.responsible}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                {fmtDate(m.startDate)} → {fmtDate(m.endDate)}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={cn(
                                    "inline-block rounded-full px-2 py-0.5 text-[11px] font-bold",
                                    STATUS[m.status].chip
                                  )}
                                >
                                  {t(STATUS[m.status].key)}
                                </span>
                                <div className="mt-1 text-[11px] font-semibold text-muted-foreground tabular-nums">
                                  {m.progressPct}%
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-xs leading-snug">
                                {m.appliedImprovements ? (
                                  <p className="text-foreground/85">
                                    {m.appliedImprovements}
                                  </p>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                                {m.verificationLink &&
                                  /^https?:\/\//i.test(m.verificationLink) && (
                                    <a
                                      href={m.verificationLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-1 inline-flex items-center gap-1 font-semibold text-brand-deep hover:underline"
                                    >
                                      <Link2 className="h-3 w-3" />
                                      {t("app.assessment.measure.openEvidence")}
                                    </a>
                                  )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
