import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { fetchOrganisationUsers } from "../infrastructure/users-api";

export const usersKeys = {
  list: (org: string) => ["users", org] as const,
};

export const usersQueries = {
  list: (org: string | undefined) =>
    queryOptions({
      queryKey: usersKeys.list(org ?? ""),
      queryFn: () => fetchOrganisationUsers(org as string),
      enabled: Boolean(org),
      staleTime: 30 * 1000,
    }),
  invalidate: (queryClient: QueryClient, org: string) =>
    queryClient.invalidateQueries({ queryKey: usersKeys.list(org) }),
};
