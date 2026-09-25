import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { PageTitle } from "@/shared/components/page-title";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ChevronRight, X } from "lucide-react";
import {
  createAssessmentProfile,
  setProfileApplicability,
  fetchAssessmentProfiles,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import { ApplicabilityEditor } from "@/modules/assessment-core/presentation/components/applicability-editor";
import type {
  CreateAssessmentProfileInput,
  AssessmentAssociationLevel,
  AssessmentProfileType,
  AssessmentOrganisationProfile,
} from "@/modules/assessment-core/infrastructure/assessment-api";

const TOTAL_STEPS = 4;
const CURRENT_YEAR = new Date().getFullYear();

// Código ISO 3166-1 alpha-2 (mismo formato que usa el resto del sistema, p.ej.
// AssessmentRiskCountryParam) + prefijo telefónico + longitud típica del
// número nacional de celular (sin el prefijo), para validar el teléfono.
interface LatamCountry {
  code: string;
  name: string;
  dialCode: string;
  phoneDigits: number;
}

const LATAM_COUNTRIES: LatamCountry[] = [
  { code: "AR", name: "Argentina", dialCode: "54", phoneDigits: 10 },
  { code: "BO", name: "Bolivia", dialCode: "591", phoneDigits: 8 },
  { code: "BR", name: "Brasil", dialCode: "55", phoneDigits: 11 },
  { code: "CL", name: "Chile", dialCode: "56", phoneDigits: 9 },
  { code: "CO", name: "Colombia", dialCode: "57", phoneDigits: 10 },
  { code: "CR", name: "Costa Rica", dialCode: "506", phoneDigits: 8 },
  { code: "CU", name: "Cuba", dialCode: "53", phoneDigits: 8 },
  { code: "EC", name: "Ecuador", dialCode: "593", phoneDigits: 9 },
  { code: "SV", name: "El Salvador", dialCode: "503", phoneDigits: 8 },
  { code: "GT", name: "Guatemala", dialCode: "502", phoneDigits: 8 },
  { code: "HT", name: "Haití", dialCode: "509", phoneDigits: 8 },
  { code: "HN", name: "Honduras", dialCode: "504", phoneDigits: 8 },
  { code: "MX", name: "México", dialCode: "52", phoneDigits: 10 },
  { code: "NI", name: "Nicaragua", dialCode: "505", phoneDigits: 8 },
  { code: "PA", name: "Panamá", dialCode: "507", phoneDigits: 8 },
  { code: "PY", name: "Paraguay", dialCode: "595", phoneDigits: 9 },
  { code: "PE", name: "Perú", dialCode: "51", phoneDigits: 9 },
  { code: "DO", name: "República Dominicana", dialCode: "1", phoneDigits: 10 },
  { code: "UY", name: "Uruguay", dialCode: "598", phoneDigits: 8 },
  { code: "VE", name: "Venezuela", dialCode: "58", phoneDigits: 10 },
];

/** Quita cualquier prefijo "+<código> " ya presente, dejando solo dígitos. */
function stripPhonePrefix(phone: string): string {
  return phone.replace(/^\+\d+\s*/, "").replace(/\D/g, "");
}

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    onChange([...value, trimmed]);
    setDraft("");
  };

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 min-h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => {
              onChange(value.filter((_, i) => i !== idx));
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Quitar ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function StepCircle({ step, current }: { step: number; current: number }) {
  const state =
    step < current ? "done" : step === current ? "active" : "pending";
  return (
    <div
      className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
      style={{
        backgroundColor:
          state === "pending" ? "hsl(var(--border))" : "var(--color-accent)",
        color: state === "pending" ? "hsl(var(--muted-foreground))" : "#fff",
      }}
    >
      {step}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 max-w-md">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step, idx) => (
        <div key={step} className="flex items-center flex-1">
          <StepCircle step={step} current={current} />
          {idx < TOTAL_STEPS - 1 && (
            <div
              className="flex-1 h-0.5 mx-1"
              style={{
                backgroundColor:
                  step < current ? "var(--color-accent)" : "hsl(var(--border))",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function NewAssessmentOrganisationPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate({ from: "/assessments/new" });

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<AssessmentProfileType>("ASSOCIATION");
  const [associationLevel, setAssociationLevel] =
    useState<AssessmentAssociationLevel>("LEVEL_1");
  const [parentProfileId, setParentProfileId] = useState("");
  const [associations, setAssociations] = useState<
    AssessmentOrganisationProfile[]
  >([]);
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [country, setCountry] = useState("");
  const [yearStarted, setYearStarted] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [mainActivity, setMainActivity] = useState("");
  const [mainProduct, setMainProduct] = useState("");
  const [secondaryProducts, setSecondaryProducts] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [mainMarkets, setMainMarkets] = useState("");

  const selectedCountry = LATAM_COUNTRIES.find((c) => c.code === country);
  const phoneNationalDigits = stripPhonePrefix(contactPhone);
  const phoneDigitsError =
    selectedCountry &&
    phoneNationalDigits.length > 0 &&
    phoneNationalDigits.length !== selectedCountry.phoneDigits
      ? t("app.assessment.wizard.phoneDigitsError", {
          digits: selectedCountry.phoneDigits,
        })
      : null;

  const [excludedSectionIds, setExcludedSectionIds] = useState<Set<string>>(
    new Set()
  );
  const [excludedIndicatorIds, setExcludedIndicatorIds] = useState<Set<string>>(
    new Set()
  );

  // Nivel 2: cuántas organizaciones miembro hay que crear justo después de
  // guardar la asociación (se pide una vez, al momento de elegir Nivel 2).
  const [childOrgCount, setChildOrgCount] = useState("");
  const [childCreation, setChildCreation] = useState<{
    parentId: string;
    parentName: string;
    total: number;
    completed: number;
  } | null>(null);

  const step2Valid = name.trim().length > 0 && country.trim().length > 0;
  const step3Valid = mainProduct.trim().length > 0;

  const isLevel2Association =
    type === "ASSOCIATION" && associationLevel === "LEVEL_2";

  const childOrgCountNum = Number(childOrgCount);
  const step1Valid =
    !isLevel2Association ||
    (childOrgCount.trim() !== "" &&
      Number.isInteger(childOrgCountNum) &&
      childOrgCountNum >= 1);

  useEffect(() => {
    if (!org || !token) return;
    let cancelled = false;
    void (async () => {
      try {
        const refreshedToken = token;
        const profiles = await fetchAssessmentProfiles(org, refreshedToken);
        if (cancelled) return;
        setAssociations(
          profiles.filter(
            (p) => p.type === "ASSOCIATION" && p.associationLevel === "LEVEL_2"
          )
        );
      } catch (err: unknown) {
        console.error("Failed to load Level 2 associations", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [org, token]);

  useEffect(() => {
    if (isLevel2Association) setParentProfileId("");
  }, [isLevel2Association]);

  const handleCountryChange = (code: string) => {
    setCountry(code);
    const dialCode = LATAM_COUNTRIES.find((c) => c.code === code)?.dialCode;
    if (dialCode) {
      const rest = stripPhonePrefix(contactPhone);
      setContactPhone(`+${dialCode} ${rest}`);
    }
  };

  const handlePhoneChange = (raw: string) => {
    const digits = stripPhonePrefix(raw).slice(
      0,
      selectedCountry?.phoneDigits
    );
    setContactPhone(
      selectedCountry ? `+${selectedCountry.dialCode} ${digits}` : raw
    );
  };

  const resetFormForNextChild = () => {
    setType("COMPANY");
    setAssociationLevel("LEVEL_1");
    setParentProfileId("");
    setName("");
    setTradeName("");
    setCountry("");
    setYearStarted("");
    setMemberCount("");
    setContactPhone("");
    setContactEmail("");
    setMainActivity("");
    setMainProduct("");
    setSecondaryProducts("");
    setCertifications([]);
    setMainMarkets("");
    setChildOrgCount("");
    setExcludedSectionIds(new Set());
    setExcludedIndicatorIds(new Set());
    setStep(1);
  };

  const handleSave = async () => {
    if (!org || !token) return;
    setSaving(true);
    try {
      const refreshedToken = token;
      const effectiveParentId = childCreation
        ? childCreation.parentId
        : !isLevel2Association && parentProfileId
          ? parentProfileId
          : undefined;
      const data: CreateAssessmentProfileInput = {
        name,
        tradeName: tradeName || undefined,
        type,
        associationLevel: type === "ASSOCIATION" ? associationLevel : undefined,
        country,
        yearStarted: yearStarted ? Number(yearStarted) : undefined,
        memberCount: memberCount ? Number(memberCount) : undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        mainActivity: mainActivity || undefined,
        mainProduct,
        secondaryProducts: secondaryProducts || undefined,
        certifications:
          certifications.length > 0 ? certifications.join(", ") : undefined,
        mainMarkets: mainMarkets || undefined,
        parentProfileId: effectiveParentId,
      };
      const profile = await createAssessmentProfile(org, data, refreshedToken);
      if (excludedSectionIds.size > 0 || excludedIndicatorIds.size > 0) {
        await setProfileApplicability(
          org,
          profile.id,
          {
            excludedSectionIds: Array.from(excludedSectionIds),
            excludedIndicatorIds: Array.from(excludedIndicatorIds),
          },
          refreshedToken
        );
      }

      // Asociación Nivel 2 recién creada con miembros pendientes: en vez de
      // salir del wizard, se reinicia el formulario para capturar cada
      // organización miembro (nombre + datos), ya enlazada a esta asociación.
      if (!childCreation && isLevel2Association && childOrgCountNum >= 1) {
        toast({
          title: t("app.common.success"),
          description: t("app.assessment.profiles.newProfile"),
          variant: "success",
        });
        setChildCreation({
          parentId: profile.id,
          parentName: profile.name,
          total: childOrgCountNum,
          completed: 0,
        });
        resetFormForNextChild();
        return;
      }

      if (childCreation) {
        const completed = childCreation.completed + 1;
        if (completed < childCreation.total) {
          toast({
            title: t("app.common.success"),
            description: t("app.assessment.profiles.newProfile"),
            variant: "success",
          });
          setChildCreation({ ...childCreation, completed });
          resetFormForNextChild();
          return;
        }
        setChildCreation(null);
      }

      toast({
        title: t("app.common.success"),
        description: t("app.assessment.profiles.newProfile"),
        variant: "success",
      });
      void navigate({ to: "/assessments" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      void handleSave();
    }
  };

  const handleBack = () => {
    if (step === 1) {
      void navigate({ to: "/assessments" });
    } else {
      setStep((s) => s - 1);
    }
  };

  const nextDisabled =
    (step === 1 && !step1Valid) ||
    (step === 2 && !step2Valid) ||
    (step === 3 && !step3Valid) ||
    saving;

  const saveLabel =
    childCreation && childCreation.completed + 1 < childCreation.total
      ? t("app.assessment.wizard.saveAndCreateNext")
      : t("app.assessment.organizational.save");

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <PageTitle rawTitle={t("app.assessment.profiles.newProfile")} />
      <p className="text-sm text-muted-foreground">
        {step === 1
          ? t("app.assessment.wizard.step1Subtitle")
          : step === 2
            ? t("app.assessment.wizard.step2Subtitle")
            : step === 3
              ? t("app.assessment.wizard.step3Subtitle")
              : t("app.assessment.wizard.step4Subtitle")}
      </p>

      <Stepper current={step} />

      {childCreation && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          {t("app.assessment.wizard.creatingChildBanner", {
            current: childCreation.completed + 1,
            total: childCreation.total,
            parent: childCreation.parentName,
          })}
        </div>
      )}

      <div className="border rounded-xl p-6 min-h-[320px]">
        {step === 1 && (
          <RadioGroup
            value={type}
            onValueChange={(v) => {
              setType(v as AssessmentProfileType);
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="COMPANY" id="type-company" />
              <Label htmlFor="type-company">
                {t("app.assessment.wizard.typeOrganisation")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ASSOCIATION" id="type-association" />
              <Label htmlFor="type-association">
                {t("app.assessment.wizard.typeAssociation")}
              </Label>
            </div>
            {type === "ASSOCIATION" && (
              <RadioGroup
                value={associationLevel}
                onValueChange={(v) => {
                  setAssociationLevel(v as AssessmentAssociationLevel);
                }}
                className="pl-8 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="LEVEL_1" id="level-1" />
                  <Label htmlFor="level-1">
                    {t("app.assessment.wizard.levelOne")}
                  </Label>
                </div>
                {!childCreation && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="LEVEL_2" id="level-2" />
                    <Label htmlFor="level-2">
                      {t("app.assessment.wizard.levelTwo")}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            )}

            {isLevel2Association && (
              <div className="pl-8 pt-1 max-w-xs">
                <Label>{t("app.assessment.wizard.childOrgCount")}</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={childOrgCount}
                  onChange={(e) => {
                    setChildOrgCount(e.target.value);
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("app.assessment.wizard.childOrgCountHint")}
                </p>
              </div>
            )}

            {!isLevel2Association && !childCreation && associations.length > 0 && (
              <div className="pt-2">
                <Label>{t("app.assessment.wizard.belongsToAssociation")}</Label>
                <Select
                  value={parentProfileId || "none"}
                  onValueChange={(v) => {
                    setParentProfileId(v === "none" ? "" : v);
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("app.assessment.wizard.noAssociation")}
                    </SelectItem>
                    {associations.map((assoc) => (
                      <SelectItem key={assoc.id} value={assoc.id}>
                        {assoc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </RadioGroup>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">
              {t("app.assessment.wizard.generalInfo")}
            </h3>
            <div>
              <Label>{t("app.assessment.wizard.name")}</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("app.assessment.wizard.tradeName")}</Label>
              <Input
                value={tradeName}
                onChange={(e) => {
                  setTradeName(e.target.value);
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("app.assessment.profiles.country")}</Label>
              <Select value={country || undefined} onValueChange={handleCountryChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={t("app.assessment.wizard.selectCountry")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {LATAM_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("app.assessment.wizard.yearStarted")}</Label>
                <Input
                  type="number"
                  min={1900}
                  max={CURRENT_YEAR}
                  value={yearStarted}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value !== "" && Number(value) > CURRENT_YEAR) {
                      setYearStarted(String(CURRENT_YEAR));
                      return;
                    }
                    setYearStarted(value);
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("app.assessment.wizard.memberCount")}</Label>
                <Input
                  type="number"
                  value={memberCount}
                  onChange={(e) => {
                    setMemberCount(e.target.value);
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("app.assessment.wizard.phone")}</Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => {
                    handlePhoneChange(e.target.value);
                  }}
                  className="mt-1"
                />
                {phoneDigitsError && (
                  <p className="text-xs text-destructive mt-1">
                    {phoneDigitsError}
                  </p>
                )}
              </div>
              <div>
                <Label>{t("app.assessment.wizard.email")}</Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">
              {t("app.assessment.wizard.secondaryInfo")}
            </h3>
            <div>
              <Label>{t("app.assessment.wizard.mainActivity")}</Label>
              <Input
                value={mainActivity}
                onChange={(e) => {
                  setMainActivity(e.target.value);
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("app.assessment.profiles.mainProduct")}</Label>
              <Input
                value={mainProduct}
                onChange={(e) => {
                  setMainProduct(e.target.value);
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("app.assessment.wizard.secondaryProducts")}</Label>
              <Textarea
                value={secondaryProducts}
                onChange={(e) => {
                  setSecondaryProducts(e.target.value);
                }}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>{t("app.assessment.wizard.certifications")}</Label>
              <TagInput
                value={certifications}
                onChange={setCertifications}
                placeholder={t("app.assessment.wizard.certificationsPlaceholder")}
              />
            </div>
            <div>
              <Label>{t("app.assessment.wizard.mainMarkets")}</Label>
              <Input
                value={mainMarkets}
                onChange={(e) => {
                  setMainMarkets(e.target.value);
                }}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              {t("app.assessment.wizard.applicabilityInfo")}
            </h3>
            <ApplicabilityEditor
              excludedSectionIds={excludedSectionIds}
              excludedIndicatorIds={excludedIndicatorIds}
              onChange={(n) => {
                setExcludedSectionIds(n.excludedSectionIds);
                setExcludedIndicatorIds(n.excludedIndicatorIds);
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={saving}>
          {step === 1
            ? t("app.common.cancel")
            : t("app.assessment.wizard.back")}
        </Button>
        <Button onClick={handleNext} disabled={nextDisabled}>
          {step < TOTAL_STEPS ? (
            <>
              {t("app.assessment.wizard.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            saveLabel
          )}
        </Button>
      </div>
    </div>
  );
}
