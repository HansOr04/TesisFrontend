import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Info,
  Lightbulb,
  Link2,
  Loader2,
  Sparkles,
  Target,
  Wand2,
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
import { RingGauge } from "./ring-gauge";
import type { MeasureProblem } from "./measure-progress-dialog";

export interface PlanMeasureValues {
  name?: string;
  description: string;
  responsible: string;
  support?: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  budgetUsd?: number;
  verificationLink?: string;
  expectedResult?: string;
}

export interface AiMeasureSuggestion {
  name?: string;
  description: string;
}

interface PlanMeasureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: MeasureProblem | null;
  /** "dates": fecha inicio/fin (planes de acción) · "week": semana + duración (mitigación). */
  scheduleMode: "dates" | "week";
  /** Las herramientas de plan de acción piden un nombre corto además de la descripción. */
  requireName?: boolean;
  saving: boolean;
  onSave: (values: PlanMeasureValues) => Promise<void>;
  /** Pide una sugerencia a la IA para este KPI. Devuelve null si no hay sugerencia. */
  onSuggest?: () => Promise<AiMeasureSuggestion | null>;
  /** Motivo por el que no se puede planificar (p.ej. riesgo despreciable). */
  blockedReason?: string | null;
  t: (key: string) => string;
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function nextMonday(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() + ((8 - day) % 7 || 7));
  return d;
}

// Popup "Planificar medida": se abre con el problema ya cargado (KPI,
// calificación, observación, riesgo) y el formulario listo para describir la
// solución; opcionalmente pide una propuesta a la IA y la vuelca al formulario.
export function PlanMeasureDialog({
  open,
  onOpenChange,
  problem,
  scheduleMode,
  requireName = false,
  saving,
  onSave,
  onSuggest,
  blockedReason,
  t,
}: PlanMeasureDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [support, setSupport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [budget, setBudget] = useState("");
  const [link, setLink] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<AiMeasureSuggestion | null>(
    null
  );
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    setName("");
    setDescription("");
    setResponsible("");
    setSupport("");
    setStartDate(
      scheduleMode === "week"
        ? toInputDate(nextMonday(today))
        : toInputDate(today)
    );
    setEndDate(toInputDate(end));
    setDurationDays("30");
    setBudget("");
    setLink("");
    setExpectedResult("");
    setShowDetails(false);
    setSuggestion(null);
    setSuggestError(null);
    setError(null);
  }, [open, scheduleMode, problem?.code]);

  const handleSuggest = async () => {
    if (!onSuggest) return;
    setSuggesting(true);
    setSuggestError(null);
    try {
      const result = await onSuggest();
      if (!result) {
        setSuggestError(t("app.assessment.plan.aiNoSuggestion"));
      } else {
        setSuggestion(result);
      }
    } catch (err) {
      setSuggestError(
        err instanceof Error ? err.message : t("app.common.error")
      );
    } finally {
      setSuggesting(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    if (suggestion.name && requireName) setName(suggestion.name);
    if (!requireName && suggestion.name && !suggestion.description)
      setDescription(suggestion.name);
    else setDescription(suggestion.description || suggestion.name || "");
  };

  const validate = (): string | null => {
    if (requireName && !name.trim()) return t("app.assessment.plan.errorName");
    if (!description.trim()) return t("app.assessment.plan.errorDescription");
    if (!responsible.trim()) return t("app.assessment.plan.errorResponsible");
    if (!startDate) return t("app.assessment.plan.errorDates");
    if (scheduleMode === "dates" && (!endDate || endDate < startDate))
      return t("app.assessment.plan.errorDates");
    if (scheduleMode === "week" && !(Number(durationDays) >= 1))
      return t("app.assessment.plan.errorDuration");
    return null;
  };

  const handleSave = async () => {
    const problemMsg = validate();
    if (problemMsg) {
      setError(problemMsg);
      return;
    }
    setError(null);
    await onSave({
      name: requireName ? name.trim() : undefined,
      description: description.trim(),
      responsible: responsible.trim(),
      support: support.trim() || undefined,
      startDate,
      endDate,
      durationDays: scheduleMode === "week" ? Number(durationDays) : undefined,
      budgetUsd: budget.trim() ? Number(budget) : undefined,
      verificationLink: link.trim() || undefined,
      expectedResult: expectedResult.trim() || undefined,
    });
  };

  const labelCls =
    "text-[11px] font-bold uppercase tracking-wide text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        {problem && (
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
              </div>
              <DialogTitle className="mt-2 text-xl font-extrabold leading-snug">
                {t("app.assessment.plan.title")}
              </DialogTitle>
              <DialogDescription>
                {t("app.assessment.plan.subtitle")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid max-h-[70vh] grid-cols-1 overflow-y-auto md:grid-cols-[1fr_1.1fr]">
              {/* ── Problema + IA ── */}
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

                {blockedReason ? (
                  <div className="flex items-start gap-2 rounded-2xl bg-warning/10 p-4 text-sm text-warning">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    {blockedReason}
                  </div>
                ) : (
                  onSuggest && (
                    <section>
                      <header className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-deep">
                        <Bot className="h-3.5 w-3.5" />{" "}
                        {t("app.assessment.plan.aiTitle")}
                      </header>
                      <div className="rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-4">
                        {!suggestion ? (
                          <>
                            <p className="text-xs text-muted-foreground">
                              {t("app.assessment.plan.aiHint")}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => void handleSuggest()}
                              disabled={suggesting}
                            >
                              {suggesting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4" />
                              )}
                              {suggesting
                                ? t("app.assessment.plan.aiLoading")
                                : t("app.assessment.plan.aiAsk")}
                            </Button>
                            {suggestError && (
                              <p className="mt-2 text-xs text-danger">
                                {suggestError}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="animate-fade-up">
                            {suggestion.name && (
                              <p className="text-sm font-semibold">
                                {suggestion.name}
                              </p>
                            )}
                            <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                              {suggestion.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button size="sm" onClick={applySuggestion}>
                                <Sparkles className="h-4 w-4" />
                                {t("app.assessment.plan.aiUse")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleSuggest()}
                                disabled={suggesting}
                              >
                                {suggesting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Wand2 className="h-4 w-4" />
                                )}
                                {t("app.assessment.plan.aiRetry")}
                              </Button>
                            </div>
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              {t("app.assessment.organizational.aiDisclaimer")}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  )
                )}
              </div>

              {/* ── Formulario de la medida ── */}
              <div className="space-y-4 p-6">
                <header className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-deep">
                  <Lightbulb className="h-3.5 w-3.5" />{" "}
                  {t("app.assessment.measure.solutionTitle")}
                </header>

                {requireName && (
                  <div>
                    <Label className={labelCls}>
                      {t("app.assessment.organizational.measureName")}
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("app.assessment.plan.namePlaceholder")}
                      className="mt-1.5"
                      disabled={Boolean(blockedReason)}
                    />
                  </div>
                )}
                <div>
                  <Label className={labelCls}>
                    {t("app.assessment.organizational.measureDescription")}
                  </Label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t(
                      "app.assessment.plan.descriptionPlaceholder"
                    )}
                    className="mt-1.5 text-sm"
                    disabled={Boolean(blockedReason)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={labelCls}>
                      {t("app.assessment.organizational.measureResponsible")}
                    </Label>
                    <Input
                      value={responsible}
                      onChange={(e) => setResponsible(e.target.value)}
                      placeholder={t(
                        "app.assessment.plan.responsiblePlaceholder"
                      )}
                      className="mt-1.5"
                      disabled={Boolean(blockedReason)}
                    />
                  </div>
                  <div>
                    <Label className={labelCls}>
                      {t("app.assessment.organizational.measureSupport")}
                    </Label>
                    <Input
                      value={support}
                      onChange={(e) => setSupport(e.target.value)}
                      placeholder={t(
                        "app.assessment.organizational.measureSupportPlaceholder"
                      )}
                      className="mt-1.5"
                      disabled={Boolean(blockedReason)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={cn(labelCls, "flex items-center gap-1")}>
                      <Calendar className="h-3 w-3" />{" "}
                      {scheduleMode === "week"
                        ? t("app.assessment.risk.measureStartWeek")
                        : t("app.assessment.organizational.measureStartDate")}
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1.5"
                      disabled={Boolean(blockedReason)}
                    />
                  </div>
                  {scheduleMode === "week" ? (
                    <div>
                      <Label className={labelCls}>
                        {t("app.assessment.risk.measureDuration")}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="mt-1.5"
                        disabled={Boolean(blockedReason)}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className={labelCls}>
                        {t("app.assessment.organizational.measureEndDate")}
                      </Label>
                      <Input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1.5"
                        disabled={Boolean(blockedReason)}
                      />
                    </div>
                  )}
                </div>
                <div className="rounded-xl bg-brand/5 p-3">
                  <Label
                    className={cn(
                      labelCls,
                      "flex items-center gap-1 text-brand-deep"
                    )}
                  >
                    <Target className="h-3.5 w-3.5" />{" "}
                    {t("app.assessment.measure.expectedResult")}
                  </Label>
                  <Textarea
                    rows={2}
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    placeholder={t(
                      "app.assessment.measure.expectedResultPlaceholder"
                    )}
                    className="mt-1.5 min-h-[56px] bg-card text-sm"
                    disabled={Boolean(blockedReason)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {t("app.assessment.plan.moreDetails")}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showDetails && "rotate-180"
                    )}
                  />
                </button>
                {showDetails && (
                  <div className="grid grid-cols-2 gap-3 animate-fade-up">
                    <div>
                      <Label className={labelCls}>
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
                      <Label
                        className={cn(labelCls, "flex items-center gap-1")}
                      >
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
                {error && (
                  <p className="rounded-xl bg-danger/8 px-3 py-2 text-sm font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="border-t bg-muted/40 px-6 py-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("app.common.cancel")}
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={saving || Boolean(blockedReason)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {saving
                  ? t("app.assessment.measure.saving")
                  : t("app.assessment.plan.save")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
