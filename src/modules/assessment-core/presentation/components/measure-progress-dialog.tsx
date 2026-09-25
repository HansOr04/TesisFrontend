import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Coins,
  Link2,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { scoreColor } from "@/shared/design/score-colors";
import type { AssessmentMeasureStatus } from "@/modules/assessment-core/infrastructure/assessment-api";
import { RingGauge } from "./ring-gauge";

export interface MeasureProblem {
  code: string;
  name: string;
  /** Calificación del KPI (1–10). */
  score?: number;
  observation?: string;
  sectionLabel?: string;
  /** Solo herramienta de riesgos. */
  riskDescription?: string;
  riskType?: string;
  riskClass?: string;
}

export interface MeasureSolution {
  title: string;
  description?: string;
  responsible: string;
  support?: string;
  startDate: string;
  endDate: string;
  budgetUsd?: number;
  verificationLink?: string;
  progressPct: number;
  status: AssessmentMeasureStatus;
  expectedResult?: string;
  appliedImprovements?: string;
}

export interface MeasureProgressValues {
  progressPct: number;
  support?: string;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
  appliedImprovements?: string;
}

interface MeasureProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: MeasureProblem | null;
  solution: MeasureSolution | null;
  saving: boolean;
  onSave: (values: MeasureProgressValues) => Promise<void>;
  t: (key: string) => string;
}

const QUICK_STEPS = [0, 25, 50, 75, 100];

function deriveStatus(pct: number): AssessmentMeasureStatus {
  if (pct >= 100) return "DONE";
  if (pct > 0) return "IN_PROGRESS";
  return "PENDING";
}

const STATUS_STYLE: Record<
  AssessmentMeasureStatus,
  { chip: string; bar: string; key: string }
> = {
  PENDING: {
    chip: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/40",
    key: "app.assessment.measure.statusPending",
  },
  IN_PROGRESS: {
    chip: "bg-warning/15 text-warning",
    bar: "bg-warning",
    key: "app.assessment.measure.statusInProgress",
  },
  DONE: {
    chip: "bg-success/12 text-success",
    bar: "bg-success",
    key: "app.assessment.measure.statusDone",
  },
};

function fmtDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

// Ventana de seguimiento de una medida: recorre el flujo Problema detectado →
// Solución propuesta → Registrar avance (con resultado esperado y mejoras
// aplicadas). La usan los planes de acción (Organizativa/Capacidades) y el
// plan de mitigación (Riesgos).
export function MeasureProgressDialog({
  open,
  onOpenChange,
  problem,
  solution,
  saving,
  onSave,
  t,
}: MeasureProgressDialogProps) {
  const [progress, setProgress] = useState(0);
  const [support, setSupport] = useState("");
  const [budget, setBudget] = useState("");
  const [link, setLink] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [appliedImprovements, setAppliedImprovements] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!solution) return;
    setProgress(solution.progressPct);
    setSupport(solution.support ?? "");
    setBudget(solution.budgetUsd != null ? String(solution.budgetUsd) : "");
    setLink(solution.verificationLink ?? "");
    setExpectedResult(solution.expectedResult ?? "");
    setAppliedImprovements(solution.appliedImprovements ?? "");
    setShowDetails(false);
  }, [solution, open]);

  const status = useMemo(() => deriveStatus(progress), [progress]);
  const style = STATUS_STYLE[status];
  const changed = solution ? progress !== solution.progressPct : false;

  const handleSave = () =>
    onSave({
      progressPct: Math.max(0, Math.min(100, Math.round(progress))),
      support: support.trim() || undefined,
      budgetUsd: budget.trim() ? Number(budget) : undefined,
      verificationLink: link.trim() || undefined,
      expectedResult: expectedResult.trim() || undefined,
      appliedImprovements: appliedImprovements.trim() || undefined,
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        {problem && solution && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-brand/6 to-transparent">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-card px-2 py-0.5 font-mono text-[11px] font-bold text-foreground/80 shadow-sm">
                  {problem.code}
                </span>
                {problem.sectionLabel && (
                  <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                    {problem.sectionLabel}
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    STATUS_STYLE[solution.status].chip
                  )}
                >
                  {t(STATUS_STYLE[solution.status].key)}
                </span>
              </div>
              <DialogTitle className="mt-2 text-xl font-extrabold leading-snug">
                {solution.title}
              </DialogTitle>
              <DialogDescription>
                {t("app.assessment.measure.dialogSubtitle")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid max-h-[70vh] grid-cols-1 overflow-y-auto md:grid-cols-[1.05fr_1fr]">
              {/* ── Columna izquierda: problema y solución ── */}
              <div className="space-y-5 border-b p-6 md:border-b-0 md:border-r">
                <section>
                  <header className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-danger">
                    <AlertTriangle className="h-3.5 w-3.5" />{" "}
                    {t("app.assessment.measure.problemTitle")}
                  </header>
                  <div className="flex gap-3 rounded-2xl bg-danger/5 p-4">
                    {problem.score !== undefined && (
                      <RingGauge
                        value={problem.score}
                        size={64}
                        strokeWidth={6}
                        color={scoreColor(problem.score)}
                        integer
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">
                        {problem.name}
                      </p>
                      {problem.riskDescription && (
                        <p className="mt-1.5 text-sm text-foreground/80">
                          <span className="font-semibold">
                            {t("app.assessment.measure.riskLabel")}:{" "}
                          </span>
                          {problem.riskDescription}
                        </p>
                      )}
                      {(problem.riskType || problem.riskClass) && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {problem.riskType && (
                            <span className="rounded-md bg-card px-1.5 py-0.5 text-[11px] font-medium shadow-sm">
                              {problem.riskType}
                            </span>
                          )}
                          {problem.riskClass && (
                            <span className="rounded-md bg-danger/10 px-1.5 py-0.5 text-[11px] font-semibold text-danger">
                              {problem.riskClass}
                            </span>
                          )}
                        </div>
                      )}
                      {problem.observation && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground/70">
                            {t("app.assessment.measure.observationLabel")}:{" "}
                          </span>
                          “{problem.observation}”
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <header className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-deep">
                    <Lightbulb className="h-3.5 w-3.5" />{" "}
                    {t("app.assessment.measure.solutionTitle")}
                  </header>
                  <div className="rounded-2xl bg-brand/5 p-4 space-y-3">
                    {solution.description && (
                      <p className="text-sm leading-relaxed text-foreground/85">
                        {solution.description}
                      </p>
                    )}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <div>
                          <dt className="text-[10px] uppercase text-muted-foreground">
                            {t(
                              "app.assessment.organizational.measureResponsible"
                            )}
                          </dt>
                          <dd className="font-semibold">
                            {solution.responsible}
                          </dd>
                        </div>
                      </div>
                      {solution.support && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <dt className="text-[10px] uppercase text-muted-foreground">
                              {t(
                                "app.assessment.organizational.measureSupport"
                              )}
                            </dt>
                            <dd className="font-semibold">
                              {solution.support}
                            </dd>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <div>
                          <dt className="text-[10px] uppercase text-muted-foreground">
                            {t("app.assessment.measure.period")}
                          </dt>
                          <dd className="font-semibold">
                            {fmtDate(solution.startDate)} →{" "}
                            {fmtDate(solution.endDate)}
                          </dd>
                        </div>
                      </div>
                      {solution.budgetUsd != null && (
                        <div className="flex items-center gap-2">
                          <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <dt className="text-[10px] uppercase text-muted-foreground">
                              {t("app.assessment.organizational.measureBudget")}
                            </dt>
                            <dd className="font-semibold">
                              USD {solution.budgetUsd.toLocaleString()}
                            </dd>
                          </div>
                        </div>
                      )}
                    </dl>
                    <div className="rounded-xl bg-card p-3 shadow-sm">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-deep">
                        <Target className="h-3.5 w-3.5" />{" "}
                        {t("app.assessment.measure.expectedResult")}
                      </div>
                      <Textarea
                        rows={2}
                        value={expectedResult}
                        onChange={(e) => setExpectedResult(e.target.value)}
                        placeholder={t(
                          "app.assessment.measure.expectedResultPlaceholder"
                        )}
                        className="min-h-[56px] text-sm"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* ── Columna derecha: avance ── */}
              <div className="space-y-5 p-6">
                <header className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-success">
                  <TrendingUp className="h-3.5 w-3.5" />{" "}
                  {t("app.assessment.measure.progressTitle")}
                </header>

                <div className="rounded-2xl border p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-extrabold tabular-nums leading-none">
                        {progress}
                        <span className="text-lg text-muted-foreground">%</span>
                      </div>
                      <div
                        className={cn(
                          "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                          style.chip
                        )}
                      >
                        {status === "DONE" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {t(style.key)}
                      </div>
                    </div>
                    {changed && (
                      <span className="text-xs text-muted-foreground">
                        {solution.progressPct}% →{" "}
                        <span className="font-semibold text-foreground">
                          {progress}%
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        style.bar
                      )}
                      style={{ width: `${Math.max(progress, 2)}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="mt-3 w-full accent-[hsl(var(--brand))]"
                    aria-label={t("app.assessment.risk.colProgress")}
                  />
                  <div className="mt-2 flex gap-1.5">
                    {QUICK_STEPS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setProgress(step)}
                        className={cn(
                          "flex-1 rounded-lg py-1 text-xs font-semibold transition-colors",
                          progress === step
                            ? "bg-brand text-white"
                            : "bg-muted text-muted-foreground hover:bg-brand/10 hover:text-brand-deep"
                        )}
                      >
                        {step}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />{" "}
                    {t("app.assessment.measure.appliedImprovements")}
                  </Label>
                  <Textarea
                    rows={4}
                    value={appliedImprovements}
                    onChange={(e) => setAppliedImprovements(e.target.value)}
                    placeholder={t(
                      "app.assessment.measure.appliedImprovementsPlaceholder"
                    )}
                    className="mt-1.5 text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {t("app.assessment.measure.moreDetails")}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showDetails && "rotate-180"
                    )}
                  />
                </button>
                {showDetails && (
                  <div className="space-y-3 animate-fade-up">
                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {t("app.assessment.organizational.measureSupport")}
                      </Label>
                      <Input
                        value={support}
                        onChange={(e) => setSupport(e.target.value)}
                        placeholder={t(
                          "app.assessment.organizational.measureSupportPlaceholder"
                        )}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {t("app.assessment.organizational.measureBudget")}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="0"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        <Link2 className="h-3 w-3" />{" "}
                        {t(
                          "app.assessment.organizational.measureVerificationLink"
                        )}
                      </Label>
                      <Input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder={t(
                          "app.assessment.organizational.measureVerificationLinkPlaceholder"
                        )}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t bg-muted/40 px-6 py-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("app.common.cancel")}
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving}>
                <CheckCircle2 className="h-4 w-4" />
                {saving
                  ? t("app.assessment.measure.saving")
                  : t("app.assessment.measure.saveProgress")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
