import { queryOptions, type QueryClient } from "@tanstack/react-query";
import {
  fetchAssessmentDashboard,
  fetchAssessmentProfiles,
  fetchProfileActionPlan,
  type AssessmentDashboardFilters,
} from "../infrastructure/assessment-api";

// Queries del núcleo (perfiles y panel consolidado).
export const coreKeys = {
  profiles: (org: string) => ["core", org, "profiles"] as const,
  dashboard: (org: string, filters: AssessmentDashboardFilters) =>
    ["core", org, "dashboard", filters] as const,
  profileActionPlan: (org: string, profileId: string) =>
    ["core", org, "profiles", profileId, "action-plan"] as const,
};

export const coreQueries = {
  profiles: (org: string | undefined) =>
    queryOptions({
      queryKey: coreKeys.profiles(org ?? ""),
      queryFn: () => fetchAssessmentProfiles(org as string),
      enabled: Boolean(org),
      staleTime: 60 * 1000,
    }),
  dashboard: (org: string | undefined, filters: AssessmentDashboardFilters) =>
    queryOptions({
      queryKey: coreKeys.dashboard(org ?? "", filters),
      queryFn: () => fetchAssessmentDashboard(org as string, filters),
      enabled: Boolean(org),
      staleTime: 30 * 1000,
      placeholderData: (previous) => previous,
    }),
  profileActionPlan: (org: string | undefined, profileId: string) =>
    queryOptions({
      queryKey: coreKeys.profileActionPlan(org ?? "", profileId),
      queryFn: () => fetchProfileActionPlan(org as string, profileId),
      enabled: Boolean(org),
      staleTime: 30 * 1000,
    }),
  invalidateProfiles: (queryClient: QueryClient, org: string) =>
    queryClient.invalidateQueries({ queryKey: coreKeys.profiles(org) }),
};
