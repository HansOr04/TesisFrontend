import { queryOptions } from "@tanstack/react-query";
import { genericPostPutPatch, genericSingleFetch } from "@/shared/api/http-client";

// RF-01: Assessment role assignment is a dedicated subsystem on top of the shared
// AuthRole/AuthUserRole tables (see server/src/assessments/assessment-core/assessment-roles.*).
// It must be used instead of the generic /auth/users/:userId/roles endpoint
// for assessment_admin/assessment_evaluator so that the assessment-core admin permission check,
// assessment-role.assign/revoke audit trail, and the active-evaluations revoke
// safeguard all apply.
export interface AssessmentUserRoleAssignment {
  id: string;
  organisation: string;
  userId: string;
  roleId: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export const assessmentRoleAssignmentsQueryOptions = (
  organisation: string,
  token?: string
) =>
  queryOptions({
    queryKey: ["assessment-role-assignments", organisation, token],
    queryFn: () => fetchAssessmentRoleAssignments(organisation, token),
    enabled: Boolean(organisation),
  });

export const fetchAssessmentRoleAssignments = async (
  organisation: string,
  token?: string
): Promise<AssessmentUserRoleAssignment[]> => {
  return genericSingleFetch<AssessmentUserRoleAssignment[]>(
    organisation,
    "/assessments/roles",
    "",
    token
  );
};

export const assignAssessmentRole = async (
  organisation: string,
  userId: string,
  roleCode: string,
  token?: string
): Promise<AssessmentUserRoleAssignment> => {
  return genericPostPutPatch<
    { userId: string; roleCode: string },
    AssessmentUserRoleAssignment
  >(organisation, "/assessments/roles", "POST", { userId, roleCode }, token);
};

export const revokeAssessmentRole = async (
  organisation: string,
  id: string,
  confirm: boolean,
  token?: string
): Promise<{ success: boolean }> => {
  return genericPostPutPatch<undefined, { success: boolean }>(
    organisation,
    `/assessments/roles/${id}${confirm ? "?confirm=true" : ""}`,
    "DELETE",
    undefined,
    token
  );
};
