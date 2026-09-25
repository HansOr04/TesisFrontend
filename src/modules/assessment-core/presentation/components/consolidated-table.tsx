import { Badge } from "@/shared/ui/badge";
import { AlertTriangle } from "lucide-react";
import { gaugeColor } from "@/modules/assessment-core/presentation/components/gauge";
import type {
  AssessmentDashboardRow,
  AssessmentDashboardTool,
  AssessmentDashboardToolSummary,
} from "@/modules/assessment-core/infrastructure/assessment-api";

interface ConsolidatedTableProps {
  rows: AssessmentDashboardRow[];
  t: (key: string) => string;
  onOpenEvaluation: (
    tool: AssessmentDashboardTool,
    evaluationId: string
  ) => void;
}

const TOOL_COLUMNS: { tool: AssessmentDashboardTool; labelKey: string }[] = [
  { tool: "ORGANIZATIONAL", labelKey: "app.assessment.organizational.title" },
  { tool: "CAPACITY", labelKey: "app.assessment.capacity.title" },
  { tool: "RISK", labelKey: "app.assessment.risk.title" },
];

function ToolCell({
  summary,
  t,
  onOpen,
}: {
  summary: AssessmentDashboardToolSummary | null;
  t: (key: string) => string;
  onOpen: () => void;
}) {
  if (!summary) {
    return (
      <td className="text-center py-3 px-2 text-muted-foreground">
        {t("app.assessment.panel.noEvaluation")}
      </td>
    );
  }
  return (
    <td
      className="text-center py-3 px-2 cursor-pointer hover:bg-muted/40"
      title={t("app.assessment.panel.viewEvaluation")}
      onClick={onOpen}
    >
      <div className="font-bold text-sm">
        {summary.globalScore !== null ? summary.globalScore.toFixed(1) : "—"}
      </div>
      {summary.globalScore !== null && (
        <div
          className="h-2 w-2 rounded-full mx-auto mt-1"
          style={{ backgroundColor: gaugeColor(summary.globalScore) }}
        />
      )}
      <Badge variant="outline" className="text-[10px] mt-1">
        {summary.status}
      </Badge>
      {summary.criticalAlertCount > 0 && (
        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-danger">
          <AlertTriangle className="h-3 w-3" />
          {summary.criticalAlertCount}
        </div>
      )}
    </td>
  );
}

export function ConsolidatedTable({
  rows,
  t,
  onOpenEvaluation,
}: ConsolidatedTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-xl">
        {t("app.assessment.dashboard.noRows")}
      </div>
    );
  }

  return (
    <div className="surface overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr>
            <th scope="col" className="text-left py-3 px-4">
              {t("app.assessment.dashboard.colOrganisation")}
            </th>
            <th scope="col" className="text-left py-3 px-2">
              {t("app.assessment.dashboard.colCountry")}
            </th>
            {TOOL_COLUMNS.map((col) => (
              <th scope="col" key={col.tool} className="text-center py-3 px-2">
                {t(col.labelKey)}
              </th>
            ))}
            <th scope="col" className="text-center py-3 px-2">
              {t("app.assessment.dashboard.colAlerts")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.profile.id} className="border-t hover:bg-muted/30">
              <td className="py-3 px-4">
                <div className="font-semibold">{row.profile.name}</div>
                <div className="text-xs italic text-muted-foreground">
                  {row.profile.mainProduct}
                </div>
              </td>
              <td className="py-3 px-2 text-muted-foreground">
                {row.profile.country}
                {row.profile.region ? ` — ${row.profile.region}` : ""}
              </td>
              {TOOL_COLUMNS.map((col) => {
                const summary =
                  col.tool === "ORGANIZATIONAL"
                    ? row.organizational
                    : col.tool === "CAPACITY"
                      ? row.capacity
                      : row.risk;
                return (
                  <ToolCell
                    key={col.tool}
                    summary={summary}
                    t={t}
                    onOpen={() => {
                      if (summary)
                        onOpenEvaluation(col.tool, summary.evaluationId);
                    }}
                  />
                );
              })}
              <td className="text-center py-3 px-2">
                {row.criticalAlertCount > 0 ? (
                  <Badge variant="destructive">{row.criticalAlertCount}</Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
