import { createFileRoute, redirect } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";

export const Route = createFileRoute(routeKeys.root)({
  beforeLoad: () => {
    throw redirect({ to: "/assessments" });
  },
});
