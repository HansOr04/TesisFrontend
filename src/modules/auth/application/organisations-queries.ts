import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { fetchOrganisations } from "../infrastructure/organisations-api";

export const organisationsKeys = {
  list: () => ["organisations"] as const,
};

export const organisationsQueries = {
  list: (enabled: boolean) =>
    queryOptions({
      queryKey: organisationsKeys.list(),
      queryFn: () => fetchOrganisations(),
      enabled,
      staleTime: 60 * 1000,
    }),
  invalidate: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: organisationsKeys.list() }),
};
