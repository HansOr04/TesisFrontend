import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { PageTitle } from "@/shared/components/page-title";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Download, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { exportAssessmentDashboard } from "@/modules/assessment-core/infrastructure/assessment-api";
import { coreQueries } from "@/modules/assessment-core/application/core-queries";
import type {
  AssessmentDashboardFilters,
  AssessmentDashboardRow,
  AssessmentDashboardTool,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import { ConsolidatedTable } from "@/modules/assessment-core/presentation/components/consolidated-table";

const EMPTY_FILTERS: AssessmentDashboardFilters = {};

export function AssessmentDashboardPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate({ from: "/assessments/dashboard" });

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const [filters, setFilters] =
    useState<AssessmentDashboardFilters>(EMPTY_FILTERS);
  const dashboardQuery = useQuery(coreQueries.dashboard(org, filters));
  const rows: AssessmentDashboardRow[] = dashboardQuery.data ?? [];
  const loading = dashboardQuery.isLoading;
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!org || !token) return;
    setExporting(true);
    try {
      const refreshedToken = token;
      await exportAssessmentDashboard(org, filters, refreshedToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleOpenEvaluation = (
    tool: AssessmentDashboardTool,
    evaluationId: string
  ) => {
    if (tool === "ORGANIZATIONAL") {
      void navigate({
        to: "/assessments/organizational/$evaluationId",
        params: { evaluationId },
      });
    } else if (tool === "CAPACITY") {
      void navigate({
        to: "/assessments/capacity/$evaluationId",
        params: { evaluationId },
      });
    } else {
      void navigate({
        to: "/assessments/risk/$evaluationId",
        params: { evaluationId },
      });
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <PageTitle rawTitle={t("app.assessment.dashboard.title")} />
          <p className="text-sm text-muted-foreground mt-1">
            {t("app.assessment.dashboard.subtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={exporting}
          onClick={() => void handleExport()}
        >
          <Download className="h-4 w-4 mr-1" />
          {t("app.assessment.dashboard.exportExcel")}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
        <div>
          <Label className="text-xs uppercase text-muted-foreground font-semibold">
            {t("app.assessment.dashboard.filterTool")}
          </Label>
          <Select
            value={filters.tool ?? "ALL"}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                tool:
                  value === "ALL"
                    ? undefined
                    : (value as AssessmentDashboardTool),
              }));
            }}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("app.assessment.dashboard.filterAllTools")}
              </SelectItem>
              <SelectItem value="ORGANIZATIONAL">
                {t("app.assessment.organizational.title")}
              </SelectItem>
              <SelectItem value="CAPACITY">
                {t("app.assessment.capacity.title")}
              </SelectItem>
              <SelectItem value="RISK">
                {t("app.assessment.risk.title")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase text-muted-foreground font-semibold">
            {t("app.assessment.dashboard.filterStatus")}
          </Label>
          <Select
            value={filters.status ?? "ALL"}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                status:
                  value === "ALL"
                    ? undefined
                    : (value as AssessmentDashboardFilters["status"]),
              }));
            }}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("app.assessment.dashboard.filterAllStatuses")}
              </SelectItem>
              <SelectItem value="DRAFT">
                {t("app.assessment.organizational.statusDraft")}
              </SelectItem>
              <SelectItem value="IN_PROGRESS">
                {t("app.assessment.organizational.statusInProgress")}
              </SelectItem>
              <SelectItem value="COMPLETED">
                {t("app.assessment.organizational.statusCompleted")}
              </SelectItem>
              <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase text-muted-foreground font-semibold">
            {t("app.assessment.dashboard.filterCountry")}
          </Label>
          <Input
            className="mt-1.5"
            value={filters.country ?? ""}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                country: e.target.value || undefined,
              }));
            }}
          />
        </div>
        <div>
          <Label className="text-xs uppercase text-muted-foreground font-semibold">
            {t("app.assessment.dashboard.filterRegion")}
          </Label>
          <Input
            className="mt-1.5"
            value={filters.region ?? ""}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                region: e.target.value || undefined,
              }));
            }}
          />
        </div>
        <div>
          <Label className="text-xs uppercase text-muted-foreground font-semibold">
            {t("app.assessment.dashboard.filterFrom")}
          </Label>
          <Input
            type="date"
            className="mt-1.5"
            value={filters.from ?? ""}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                from: e.target.value || undefined,
              }));
            }}
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label className="text-xs uppercase text-muted-foreground font-semibold">
              {t("app.assessment.dashboard.filterTo")}
            </Label>
            <Input
              type="date"
              className="mt-1.5"
              value={filters.to ?? ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  to: e.target.value || undefined,
                }));
              }}
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              title={t("app.assessment.dashboard.clearFilters")}
              onClick={() => {
                setFilters(EMPTY_FILTERS);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <ConsolidatedTable
          rows={rows}
          t={t}
          onOpenEvaluation={handleOpenEvaluation}
        />
      )}
    </div>
  );
}
