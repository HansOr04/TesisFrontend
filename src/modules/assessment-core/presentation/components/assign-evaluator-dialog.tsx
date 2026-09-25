import { useEffect, useState, type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "@/shared/ui/use-toast";
import { useTranslation } from "@/shared/i18n/i18n";
import { useAuth } from "@/modules/auth/application/auth-context";
import { assessmentRoleAssignmentsQueryOptions } from "@/modules/assessment-core/infrastructure/assessment-roles-api";
import { updateAssessmentProfile } from "@/modules/assessment-core/infrastructure/assessment-api";
import type { AssessmentOrganisationProfile } from "@/modules/assessment-core/infrastructure/assessment-api";

const UNASSIGNED = "__unassigned__";

export const AssignEvaluatorDialog: FC<{
  organisation: string;
  profile: AssessmentOrganisationProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}> = ({ organisation, profile, open, onOpenChange, onSaved }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const token = auth.currentUser?.accessToken;
  const isActuallySuperAdmin = auth.isActuallySuperAdmin;

  const evaluatorsQuery = useQuery({
    ...assessmentRoleAssignmentsQueryOptions(organisation, token),
    enabled: open && Boolean(organisation),
  });

  const evaluators = (evaluatorsQuery.data || []).filter(
    (a) => a.role.code === "assessment_evaluator"
  );

  const [evaluatorId, setEvaluatorId] = useState<string>(
    profile.evaluatorId || UNASSIGNED
  );
  const [confidential, setConfidential] = useState<boolean>(
    Boolean(profile.confidential)
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEvaluatorId(profile.evaluatorId || UNASSIGNED);
      setConfidential(Boolean(profile.confidential));
    }
  }, [open, profile.evaluatorId, profile.confidential]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const refreshedToken = token;
      await updateAssessmentProfile(
        organisation,
        profile.id,
        {
          evaluatorId: evaluatorId === UNASSIGNED ? null : evaluatorId,
          ...(isActuallySuperAdmin ? { confidential } : {}),
        },
        refreshedToken
      );
      toast({
        title: t("app.common.success"),
        description: t("app.assessment.profiles.assignEvaluatorSuccess"),
        variant: "success",
      });
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("app.assessment.profiles.assignEvaluatorTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("app.assessment.profiles.assignEvaluatorLabel")}</Label>
            <Select value={evaluatorId} onValueChange={setEvaluatorId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>
                  {t("app.assessment.profiles.assignEvaluatorNone")}
                </SelectItem>
                {evaluators.map((a) => (
                  <SelectItem key={a.userId} value={a.userId}>
                    {a.user?.name || a.user?.email || a.userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {evaluators.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {t("app.assessment.profiles.assignEvaluatorEmptyHint")}
              </p>
            )}
          </div>

          {isActuallySuperAdmin && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="confidential"
                checked={confidential}
                onCheckedChange={(checked) => setConfidential(Boolean(checked))}
              />
              <Label htmlFor="confidential" className="font-normal">
                {t("app.assessment.profiles.confidentialLabel")}
              </Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("app.common.cancel")}
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {t("activity.submit.default")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
