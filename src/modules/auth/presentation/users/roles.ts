import type {
  AssessmentRoleCode,
  OrganisationUser,
} from "../../infrastructure/users-api";

export const ROLE_OPTIONS: {
  code: AssessmentRoleCode | "";
  label: string;
  description: string;
}[] = [
  {
    code: "assessment_evaluator",
    label: "app.users.roleEvaluator",
    description: "app.users.roleEvaluatorDescription",
  },
  {
    code: "assessment_admin",
    label: "app.users.roleAdmin",
    description: "app.users.roleAdminDescription",
  },
  {
    code: "assessment_viewer",
    label: "app.users.roleViewer",
    description: "app.users.roleViewerDescription",
  },
  {
    code: "",
    label: "app.users.roleNone",
    description: "app.users.roleNoneDescription",
  },
];

export function roleTone(role: AssessmentRoleCode | ""): string {
  switch (role) {
    case "assessment_admin":
      return "bg-success/12 text-success";
    case "assessment_evaluator":
      return "bg-[#196AC8]/10 text-[#196AC8]";
    case "assessment_viewer":
      return "bg-[#7A3EB1]/10 text-[#7A3EB1]";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function roleOf(u: OrganisationUser): AssessmentRoleCode | "" {
  return (u.roles[0]?.code as AssessmentRoleCode | undefined) ?? "";
}
