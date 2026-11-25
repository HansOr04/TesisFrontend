import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/modules/auth/presentation/login-page";

export const Route = createFileRoute("/login")({ component: LoginPage });
