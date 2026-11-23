import { genericGet, genericPostPutPatch } from "@/shared/api/http-client";

export type AssessmentRoleCode =
  | "assessment_admin"
  | "assessment_evaluator"
  | "assessment_viewer";

/** Qué organizaciones evaluadas ve un visualizador. */
export interface ViewerVisibility {
  allProfiles: boolean;
  profileIds: string[];
}

export interface OrganisationUser {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  hasPassword: boolean;
  oauthProvider: string | null;
  createdAt: string;
  roles: {
    assignmentId: string;
    code: string;
    name: string;
    /** Solo en el rol de visualizador. */
    visibility?: ViewerVisibility;
  }[];
}

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  roleCode?: AssessmentRoleCode;
  isSuperAdmin?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  isActive?: boolean;
  password?: string;
  isSuperAdmin?: boolean;
  roleCode?: AssessmentRoleCode | null;
}

export const fetchOrganisationUsers = (org: string, token?: string) =>
  genericGet<OrganisationUser[]>(org, "/users", token);
export const createOrganisationUser = (
  org: string,
  data: CreateUserInput,
  token?: string
) =>
  genericPostPutPatch<CreateUserInput, OrganisationUser>(
    org,
    "/users",
    "POST",
    data,
    token
  );
export const updateOrganisationUser = (
  org: string,
  id: string,
  data: UpdateUserInput,
  token?: string
) =>
  genericPostPutPatch<UpdateUserInput, OrganisationUser>(
    org,
    `/users/${id}`,
    "PATCH",
    data,
    token
  );
export const removeOrganisationUser = (
  org: string,
  id: string,
  token?: string
) =>
  genericPostPutPatch<undefined, { success: boolean }>(
    org,
    `/users/${id}`,
    "DELETE",
    undefined,
    token
  );

/** Define qué organizaciones evaluadas ve un usuario con rol de visualizador. */
export const setViewerVisibility = (
  org: string,
  id: string,
  data: ViewerVisibility,
  token?: string
) =>
  genericPostPutPatch<ViewerVisibility, OrganisationUser>(
    org,
    `/users/${id}/visibility`,
    "PUT",
    data,
    token
  );
