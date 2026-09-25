import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { HttpResponseError } from "@/shared/lib/http-response-error";
import type {
  AssessmentTemplateData,
  AssessmentSectionData,
  AssessmentIndicatorData,
  CreateAssessmentSectionInput,
  UpdateAssessmentSectionInput,
  CreateAssessmentIndicatorInput,
  UpdateAssessmentIndicatorInput,
} from "@/modules/assessment-core/infrastructure/assessment-api";

interface AssessmentTemplateAdminProps {
  toolTitle: string;
  sectionLabel: string;
  onBack: () => void;
  fetchTemplates: (
    org: string,
    token?: string
  ) => Promise<AssessmentTemplateData[]>;
  createSection: (
    org: string,
    templateId: string,
    data: CreateAssessmentSectionInput,
    token?: string
  ) => Promise<AssessmentSectionData>;
  updateSection: (
    org: string,
    sectionId: string,
    data: UpdateAssessmentSectionInput,
    confirm: boolean,
    token?: string
  ) => Promise<AssessmentSectionData>;
  deleteSection: (
    org: string,
    sectionId: string,
    confirm: boolean,
    token?: string
  ) => Promise<{ success: boolean }>;
  createIndicator: (
    org: string,
    sectionId: string,
    data: CreateAssessmentIndicatorInput,
    token?: string
  ) => Promise<AssessmentIndicatorData>;
  updateIndicator: (
    org: string,
    indicatorId: string,
    data: UpdateAssessmentIndicatorInput,
    confirm: boolean,
    token?: string
  ) => Promise<AssessmentIndicatorData>;
  deleteIndicator: (
    org: string,
    indicatorId: string,
    confirm: boolean,
    token?: string
  ) => Promise<{ success: boolean }>;
}

interface SectionFormState {
  id: string | null;
  number: string;
  name: string;
  description: string;
  weight: string;
}

interface IndicatorFormState {
  id: string | null;
  sectionId: string;
  code: string;
  name: string;
  description: string;
  weight: string;
  active: boolean;
}

const EMPTY_SECTION_FORM: SectionFormState = {
  id: null,
  number: "",
  name: "",
  description: "",
  weight: "1",
};

const EMPTY_INDICATOR_FORM: IndicatorFormState = {
  id: null,
  sectionId: "",
  code: "",
  name: "",
  description: "",
  weight: "1",
  active: true,
};

// Consumido por app/src/routes/_loggedin/assessments/{organizational,risk,capacity}/admin.tsx —
// un único componente de administración de estructura (secciones + KPI) para
// las 3 herramientas, ya que AssessmentSection/AssessmentIndicator son modelos compartidos
// y el backend ya expone el CRUD completo (versionado copy-on-write: editar una
// plantilla ya evaluada crea una nueva versión en vez de mutar la existente).
export function AssessmentTemplateAdmin({
  toolTitle,
  sectionLabel,
  onBack,
  fetchTemplates,
  createSection,
  updateSection,
  deleteSection,
  createIndicator,
  updateIndicator,
  deleteIndicator,
}: AssessmentTemplateAdminProps) {
  const auth = useAuth();
  const { t } = useTranslation();

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const [template, setTemplate] = useState<AssessmentTemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(
    new Set()
  );

  const [sectionForm, setSectionForm] = useState<SectionFormState | null>(null);
  const [indicatorForm, setIndicatorForm] = useState<IndicatorFormState | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const loadTemplate = useCallback(async () => {
    if (!org || !token) return;
    setLoading(true);
    try {
      const refreshedToken = token;
      const templates = await fetchTemplates(org, refreshedToken);
      const active = templates.find((tpl) => tpl.active) ?? templates[0];
      setTemplate(active ?? null);
    } catch (err: unknown) {
      console.error("Failed to load Assessment template", err);
    } finally {
      setLoading(false);
    }
  }, [org, token, fetchTemplates]);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  const toggleSection = (sectionId: string) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const showError = (err: unknown) => {
    const message = err instanceof Error ? err.message : "Unknown error";
    toast({
      title: t("app.common.error"),
      description: message,
      variant: "destructive",
    });
  };

  // ── Sección ──────────────────────────────────────────────────────────────

  const openNewSection = () => {
    setSectionForm({
      ...EMPTY_SECTION_FORM,
      number: String((template?.sections.length ?? 0) + 1),
    });
  };

  const openEditSection = (section: AssessmentSectionData) => {
    setSectionForm({
      id: section.id,
      number: String(section.number),
      name: section.name,
      description: section.description ?? "",
      weight: String(section.weight),
    });
  };

  const handleSaveSection = async (confirm = false) => {
    if (!org || !token || !sectionForm || !template) return;
    setSaving(true);
    try {
      const refreshedToken = token;
      const data = {
        number: Number(sectionForm.number),
        name: sectionForm.name,
        description: sectionForm.description || undefined,
        weight: Number(sectionForm.weight),
      };
      if (sectionForm.id) {
        await updateSection(org, sectionForm.id, data, confirm, refreshedToken);
      } else {
        await createSection(org, template.id, data, refreshedToken);
      }
      setSectionForm(null);
      await loadTemplate();
    } catch (err: unknown) {
      if (err instanceof HttpResponseError && err.status === 409 && !confirm) {
        if (
          window.confirm(t("app.assessment.admin.confirmEditActiveEvaluation"))
        ) {
          await handleSaveSection(true);
          return;
        }
      } else {
        showError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (
    section: AssessmentSectionData,
    confirm = false
  ) => {
    if (!org || !token) return;
    if (
      !confirm &&
      !window.confirm(t("app.assessment.admin.confirmDeleteSection"))
    )
      return;
    setSaving(true);
    try {
      const refreshedToken = token;
      await deleteSection(org, section.id, confirm, refreshedToken);
      await loadTemplate();
    } catch (err: unknown) {
      if (err instanceof HttpResponseError && err.status === 409 && !confirm) {
        if (
          window.confirm(t("app.assessment.admin.confirmEditActiveEvaluation"))
        ) {
          await handleDeleteSection(section, true);
          return;
        }
      } else {
        showError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Indicador ────────────────────────────────────────────────────────────

  const openNewIndicator = (section: AssessmentSectionData) => {
    setIndicatorForm({
      ...EMPTY_INDICATOR_FORM,
      sectionId: section.id,
      code: `${section.number}.${section.indicators.length + 1}`,
    });
  };

  const openEditIndicator = (
    section: AssessmentSectionData,
    indicator: AssessmentIndicatorData
  ) => {
    setIndicatorForm({
      id: indicator.id,
      sectionId: section.id,
      code: indicator.code,
      name: indicator.name,
      description: indicator.description ?? "",
      weight: String(indicator.weight),
      active: indicator.active,
    });
  };

  const handleSaveIndicator = async (confirm = false) => {
    if (!org || !token || !indicatorForm) return;
    setSaving(true);
    try {
      const refreshedToken = token;
      if (indicatorForm.id) {
        await updateIndicator(
          org,
          indicatorForm.id,
          {
            code: indicatorForm.code,
            name: indicatorForm.name,
            description: indicatorForm.description || undefined,
            weight: Number(indicatorForm.weight),
            active: indicatorForm.active,
          },
          confirm,
          refreshedToken
        );
      } else {
        await createIndicator(
          org,
          indicatorForm.sectionId,
          {
            code: indicatorForm.code,
            name: indicatorForm.name,
            description: indicatorForm.description || undefined,
            weight: Number(indicatorForm.weight),
          },
          refreshedToken
        );
      }
      setIndicatorForm(null);
      await loadTemplate();
    } catch (err: unknown) {
      if (err instanceof HttpResponseError && err.status === 409 && !confirm) {
        if (
          window.confirm(t("app.assessment.admin.confirmEditActiveEvaluation"))
        ) {
          await handleSaveIndicator(true);
          return;
        }
      } else {
        showError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIndicator = async (
    indicator: AssessmentIndicatorData,
    confirm = false
  ) => {
    if (!org || !token) return;
    if (
      !confirm &&
      !window.confirm(t("app.assessment.admin.confirmDeleteIndicator"))
    )
      return;
    setSaving(true);
    try {
      const refreshedToken = token;
      await deleteIndicator(org, indicator.id, confirm, refreshedToken);
      await loadTemplate();
    } catch (err: unknown) {
      if (err instanceof HttpResponseError && err.status === 409 && !confirm) {
        if (
          window.confirm(t("app.assessment.admin.confirmEditActiveEvaluation"))
        ) {
          await handleDeleteIndicator(indicator, true);
          return;
        }
      } else {
        showError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        {t("app.assessment.admin.noTemplate")}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("app.common.back")}
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--color-brand)" }}
            >
              {toolTitle}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              — {t("app.assessment.admin.title")}
            </span>
          </div>
        </div>
        <Button onClick={openNewSection}>
          <Plus className="h-4 w-4 mr-1" />
          {t("app.assessment.admin.newSection")} {sectionLabel}
        </Button>
      </div>

      <div className="space-y-2">
        {template.sections.map((section) => {
          const expanded = expandedSectionIds.has(section.id);
          return (
            <div key={section.id} className="border rounded-xl">
              <div className="flex items-center gap-2 p-3">
                <button
                  type="button"
                  className="shrink-0"
                  onClick={() => {
                    toggleSection(section.id);
                  }}
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {sectionLabel} {section.number}: {section.name}
                  </p>
                  {section.description && (
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline">
                  {t("app.assessment.admin.weight")}: {section.weight}
                </Badge>
                <Badge variant="secondary">
                  {section.indicators.length} KPI
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("app.common.edit")}
                  onClick={() => {
                    openEditSection(section);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("app.common.delete")}
                  onClick={() => void handleDeleteSection(section)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </Button>
              </div>

              {expanded && (
                <div className="border-t px-3 py-2 space-y-2 bg-muted/20">
                  {section.indicators.map((indicator) => (
                    <div
                      key={indicator.id}
                      className="flex items-center gap-2 rounded-md border bg-background p-2"
                    >
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                        {indicator.code}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">
                          {indicator.name}
                        </p>
                        {indicator.description && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {indicator.description}
                          </p>
                        )}
                      </div>
                      {!indicator.active && (
                        <Badge variant="outline" className="text-[10px]">
                          {t("app.assessment.admin.inactive")}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {t("app.assessment.admin.weight")}: {indicator.weight}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("app.common.edit")}
                        className="h-7 w-7"
                        onClick={() => {
                          openEditIndicator(section, indicator);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("app.common.delete")}
                        className="h-7 w-7"
                        onClick={() => void handleDeleteIndicator(indicator)}
                      >
                        <Trash2 className="h-3 w-3 text-danger" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openNewIndicator(section);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {t("app.assessment.admin.newIndicator")}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog
        open={sectionForm !== null}
        onOpenChange={(open) => {
          if (!open) setSectionForm(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-brand)" }}>
              {sectionForm?.id
                ? t("app.assessment.admin.editSection")
                : t("app.assessment.admin.newSection")}{" "}
              {sectionLabel}
            </DialogTitle>
          </DialogHeader>
          {sectionForm && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground font-semibold">
                    {t("app.assessment.admin.number")}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={sectionForm.number}
                    onChange={(e) => {
                      setSectionForm({
                        ...sectionForm,
                        number: e.target.value,
                      });
                    }}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground font-semibold">
                    {t("app.assessment.admin.weight")}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={sectionForm.weight}
                    onChange={(e) => {
                      setSectionForm({
                        ...sectionForm,
                        weight: e.target.value,
                      });
                    }}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.admin.name")}
                </Label>
                <Input
                  value={sectionForm.name}
                  onChange={(e) => {
                    setSectionForm({ ...sectionForm, name: e.target.value });
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.admin.description")}
                </Label>
                <Textarea
                  value={sectionForm.description}
                  onChange={(e) => {
                    setSectionForm({
                      ...sectionForm,
                      description: e.target.value,
                    });
                  }}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSectionForm(null);
              }}
            >
              {t("app.common.cancel")}
            </Button>
            <Button
              onClick={() => void handleSaveSection(false)}
              disabled={saving || !sectionForm?.name || !sectionForm?.number}
            >
              {t("app.assessment.admin.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={indicatorForm !== null}
        onOpenChange={(open) => {
          if (!open) setIndicatorForm(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-brand)" }}>
              {indicatorForm?.id
                ? t("app.assessment.admin.editIndicator")
                : t("app.assessment.admin.newIndicator")}
            </DialogTitle>
          </DialogHeader>
          {indicatorForm && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground font-semibold">
                    {t("app.assessment.admin.code")}
                  </Label>
                  <Input
                    value={indicatorForm.code}
                    onChange={(e) => {
                      setIndicatorForm({
                        ...indicatorForm,
                        code: e.target.value,
                      });
                    }}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground font-semibold">
                    {t("app.assessment.admin.weight")}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={indicatorForm.weight}
                    onChange={(e) => {
                      setIndicatorForm({
                        ...indicatorForm,
                        weight: e.target.value,
                      });
                    }}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.admin.name")}
                </Label>
                <Input
                  value={indicatorForm.name}
                  onChange={(e) => {
                    setIndicatorForm({
                      ...indicatorForm,
                      name: e.target.value,
                    });
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.admin.description")}
                </Label>
                <Textarea
                  value={indicatorForm.description}
                  onChange={(e) => {
                    setIndicatorForm({
                      ...indicatorForm,
                      description: e.target.value,
                    });
                  }}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              {indicatorForm.id && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={indicatorForm.active}
                    onChange={(e) => {
                      setIndicatorForm({
                        ...indicatorForm,
                        active: e.target.checked,
                      });
                    }}
                  />
                  {t("app.assessment.admin.activeInTemplate")}
                </label>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIndicatorForm(null);
              }}
            >
              {t("app.common.cancel")}
            </Button>
            <Button
              onClick={() => void handleSaveIndicator(false)}
              disabled={saving || !indicatorForm?.name || !indicatorForm?.code}
            >
              {t("app.assessment.admin.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
