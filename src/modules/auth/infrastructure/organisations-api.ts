import {
  genericMutateWithoutOrganisation,
  genericSingleFetchWithoutOrganisation,
} from "@/shared/api/http-client";

/** Organización (inquilino) con el volumen de datos que contiene. */
export interface Organisation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: number;
  profiles: number;
  evaluations: number;
  templates: number;
}

export interface CreateOrganisationInput {
  id: string;
  name: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

export interface ProvisionedTemplate {
  tool: string;
  sections: number;
  indicators: number;
}

export interface CreateOrganisationResult {
  organisation: Organisation;
  templates: ProvisionedTemplate[];
  admin: { id: string; email: string; created: boolean };
}

export const fetchOrganisations = (token?: string) =>
  genericSingleFetchWithoutOrganisation<Organisation[]>(
    "/organisations",
    "",
    token
  );

export const createOrganisation = (
  data: CreateOrganisationInput,
  token?: string
) =>
  genericMutateWithoutOrganisation<
    CreateOrganisationInput,
    CreateOrganisationResult
  >("/organisations", "POST", data, token);

export const updateOrganisation = (
  id: string,
  data: { name: string },
  token?: string
) =>
  genericMutateWithoutOrganisation<{ name: string }, Organisation>(
    `/organisations/${encodeURIComponent(id)}`,
    "PATCH",
    data,
    token
  );

/** Reaplica las plantillas base sobre una organización existente. */
export const provisionOrganisation = (id: string, token?: string) =>
  genericMutateWithoutOrganisation<
    undefined,
    { templates: ProvisionedTemplate[] }
  >(
    `/organisations/${encodeURIComponent(id)}/provision`,
    "POST",
    undefined,
    token
  );
