import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { UsersPage } from "@/modules/auth/presentation/users/users.page";

export const Route = createFileRoute(routeKeys.assessmentUsers)({ component: UsersPage });
