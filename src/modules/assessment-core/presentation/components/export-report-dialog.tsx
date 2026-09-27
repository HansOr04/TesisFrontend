import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import type { Translate } from "@/shared/i18n/i18n";

/** Qué abarca el Gantt del reporte. Debe coincidir con el DTO del backend. */
export type GanttScope = "tool" | "organisation" | "project";

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope: GanttScope) => void;
  exporting: boolean;
  t: Translate;
}

const SCOPES: { value: GanttScope; labelKey: string; helpKey: string }[] = [
  {
    value: "tool",
    labelKey: "app.assessment.report.scopeTool",
    helpKey: "app.assessment.report.scopeToolHelp",
  },
  {
    value: "organisation",
    labelKey: "app.assessment.report.scopeOrganisation",
    helpKey: "app.assessment.report.scopeOrganisationHelp",
  },
  {
    value: "project",
    labelKey: "app.assessment.report.scopeProject",
    helpKey: "app.assessment.report.scopeProjectHelp",
  },
];

/**
 * El reporte siempre lleva el mismo contenido; lo único que se elige al
 * generarlo es hasta dónde llega el Gantt del plan de acción, porque a veces
 * interesa el plan de esta evaluación y a veces el de toda la organización o
 * el del proyecto entero.
 */
export function ExportReportDialog({
  open,
  onOpenChange,
  onConfirm,
  exporting,
  t,
}: ExportReportDialogProps) {
  const [scope, setScope] = useState<GanttScope>("tool");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("app.assessment.report.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("app.assessment.report.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={scope}
          onValueChange={(value) => {
            setScope(value as GanttScope);
          }}
          className="space-y-3"
        >
          {SCOPES.map((option) => (
            <div key={option.value} className="flex items-start gap-3">
              <RadioGroupItem
                value={option.value}
                id={`gantt-scope-${option.value}`}
                className="mt-1"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor={`gantt-scope-${option.value}`}
                  className="font-semibold"
                >
                  {t(option.labelKey)}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(option.helpKey)}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={exporting}
          >
            {t("app.common.cancel")}
          </Button>
          <Button
            disabled={exporting}
            onClick={() => {
              onConfirm(scope);
            }}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting
              ? t("app.assessment.report.generating")
              : t("app.assessment.report.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
