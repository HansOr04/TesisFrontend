import { createFileRoute } from "@tanstack/react-router";
import { routeKeys } from "@/shared/config/route-keys";
import { LoginPage } from "@/modules/auth/presentation/login-page";

export const Route = createFileRoute(routeKeys.login)({ component: LoginPage });
