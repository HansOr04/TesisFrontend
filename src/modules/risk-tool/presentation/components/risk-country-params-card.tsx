import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Trash2 } from "lucide-react";
import { useTranslation } from "@/shared/i18n/i18n";
import { useAuth } from "@/modules/auth/application/auth-context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/use-toast";
import {
  deleteRiskCountryParam,
  fetchRiskCountryParams,
  upsertRiskCountryParam,
} from "../../infrastructure/risk-api";

// Umbral de despreciabilidad por país: score > umbral ⇒ riesgo despreciable.
// Si un país no tiene fila, aplica el umbral de la plantilla (5).
export function RiskCountryParamsCard() {
  const auth = useAuth();
  const { t } = useTranslation();
  const org = auth.organisations?.current;
  const queryClient = useQueryClient();
  const queryKey = ["risk", org ?? "", "country-params"] as const;

  const params = useQuery({
    queryKey,
    queryFn: () => fetchRiskCountryParams(org as string),
    enabled: Boolean(org),
  });

  const [country, setCountry] = useState("");
  const [threshold, setThreshold] = useState("5");

  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  const save = useMutation({
    mutationFn: () =>
      upsertRiskCountryParam(org as string, {
        country: country.trim().toUpperCase(),
        riskThreshold: Number(threshold),
      }),
    onSuccess: () => {
      setCountry("");
      setThreshold("5");
      void invalidate();
      toast({ title: t("app.risk.countryParams.saved"), variant: "success" });
    },
    onError: (err) =>
      toast({
        title: t("app.common.error"),
        description:
          err instanceof Error
            ? err.message
            : t("app.risk.countryParams.saveFailed"),
        variant: "destructive",
      }),
  });
  const remove = useMutation({
    mutationFn: (code: string) => deleteRiskCountryParam(org as string, code),
    onSuccess: () => void invalidate(),
  });

  const canSave =
    /^[A-Za-z]{2,3}$/.test(country.trim()) &&
    Number(threshold) >= 1 &&
    Number(threshold) <= 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-brand" />
          {t("app.risk.countryParams.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("app.risk.countryParams.description")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-2">
                {t("app.risk.countryParams.country")}
              </th>
              <th scope="col" className="py-2">
                {t("app.risk.countryParams.threshold")}
              </th>
              <th scope="col" className="py-2 text-right">
                {t("app.risk.countryParams.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {(params.data ?? []).map((p) => (
              <tr key={p.country} className="border-t border-border">
                <td className="py-2 font-semibold">{p.country}</td>
                <td className="py-2">{p.riskThreshold}</td>
                <td className="py-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={t("app.risk.countryParams.remove", {
                      country: p.country,
                    })}
                    onClick={() => remove.mutate(p.country)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {!params.isLoading && (params.data ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 text-muted-foreground">
                  {t("app.risk.countryParams.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) save.mutate();
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="risk-country">
              {t("app.risk.countryParams.countryLabel")}
            </Label>
            <Input
              id="risk-country"
              value={country}
              maxLength={3}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="EC"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="risk-threshold">
              {t("app.risk.countryParams.thresholdLabel")}
            </Label>
            <Input
              id="risk-threshold"
              type="number"
              min={1}
              max={10}
              step={0.5}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!canSave || save.isPending}>
            {t("app.risk.countryParams.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
