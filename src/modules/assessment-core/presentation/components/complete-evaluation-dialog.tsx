import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/shared/i18n/i18n";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

// Doble confirmación antes de completar una evaluación: completarla la cierra
// (queda en el historial en solo lectura), así que primero se muestra un
// resumen de lo calificado y después se pide confirmar de forma explícita.
export function CompleteEvaluationDialog({
  open,
  onOpenChange,
  onConfirm,
  answered,
  total,
  critical,
  completing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  answered: number;
  total: number;
  critical: number;
  completing?: boolean;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setChecked(false);
    }
  }, [open]);

  const missing = Math.max(0, total - answered);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                {t("app.assessment.complete.title")}
              </DialogTitle>
              <DialogDescription>
                {t("app.assessment.complete.description")}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border p-3">
                <dt className="text-xs text-muted-foreground">
                  {t("app.assessment.complete.answered")}
                </dt>
                <dd className="mt-1 text-lg font-bold">
                  {answered} / {total}
                </dd>
              </div>
              <div className="rounded-xl border p-3">
                <dt className="text-xs text-muted-foreground">
                  {t("app.assessment.complete.missing")}
                </dt>
                <dd
                  className={`mt-1 text-lg font-bold ${missing > 0 ? "text-danger" : ""}`}
                >
                  {missing}
                </dd>
              </div>
              <div className="rounded-xl border p-3">
                <dt className="text-xs text-muted-foreground">
                  {t("app.assessment.complete.critical")}
                </dt>
                <dd className="mt-1 text-lg font-bold text-danger">
                  {critical}
                </dd>
              </div>
            </dl>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("app.common.cancel")}
              </Button>
              <Button onClick={() => setStep(2)}>
                {t("app.assessment.complete.continue")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
                <AlertTriangle className="h-5 w-5 text-warning" />
                {t("app.assessment.complete.confirmTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("app.assessment.complete.confirmDescription")}
              </DialogDescription>
            </DialogHeader>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-warning/40 bg-warning/5 p-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[hsl(var(--brand))]"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <span>{t("app.assessment.complete.confirmCheck")}</span>
            </label>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                {t("app.assessment.complete.back")}
              </Button>
              <Button
                disabled={!checked || completing}
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
              >
                {t("app.assessment.complete.confirm")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
