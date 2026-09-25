import { useEffect, useState } from "react";
import { CheckCircle2, SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/use-toast";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import {
  fetchProfileApplicability,
  setProfileApplicability,
  type AssessmentOrganisationProfile,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import { ApplicabilityEditor } from "./applicability-editor";

interface Props {
  profile: AssessmentOrganisationProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

// Editar qué KPI aplican a una organización ya creada. Los KPI marcados como
// "no aplica" no se exigen al completar la evaluación ni entran en el puntaje.
export function ApplicabilityDialog({
  profile,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const auth = useAuth();
  const { t } = useTranslation();
  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;
  const [excludedSectionIds, setExcludedSectionIds] = useState<Set<string>>(
    new Set()
  );
  const [excludedIndicatorIds, setExcludedIndicatorIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !profile || !org || !token) return;
    setLoading(true);
    fetchProfileApplicability(org, profile.id, token)
      .then((a) => {
        setExcludedSectionIds(new Set(a.excludedSectionIds));
        setExcludedIndicatorIds(new Set(a.excludedIndicatorIds));
      })
      .catch((err) => console.error("Failed to load applicability", err))
      .finally(() => setLoading(false));
  }, [open, profile, org, token]);

  const handleSave = async () => {
    if (!profile || !org || !token) return;
    setSaving(true);
    try {
      await setProfileApplicability(
        org,
        profile.id,
        {
          excludedSectionIds: [...excludedSectionIds],
          excludedIndicatorIds: [...excludedIndicatorIds],
        },
        token
      );
      toast({
        title: "Guardado",
        description: t("app.applicability.saved"),
        variant: "success",
      });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : t("app.applicability.saveFailed"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-brand/6 to-transparent">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <SlidersHorizontal className="h-5 w-5 text-brand" />{" "}
            {t("app.applicability.title", { name: profile?.name ?? "" })}
          </DialogTitle>
          <DialogDescription>
            {t("app.applicability.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("app.applicability.loading")}
            </p>
          ) : (
            <ApplicabilityEditor
              excludedSectionIds={excludedSectionIds}
              excludedIndicatorIds={excludedIndicatorIds}
              onChange={(n) => {
                setExcludedSectionIds(n.excludedSectionIds);
                setExcludedIndicatorIds(n.excludedIndicatorIds);
              }}
            />
          )}
        </div>
        <DialogFooter className="border-t bg-muted/40 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("app.common.cancel")}
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={saving || loading}
          >
            <CheckCircle2 className="h-4 w-4" />{" "}
            {saving
              ? t("app.applicability.saving")
              : t("app.applicability.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
