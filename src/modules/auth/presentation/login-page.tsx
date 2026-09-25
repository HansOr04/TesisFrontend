import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useTranslation } from "@/shared/i18n/i18n";
import { useAuth } from "../application/auth-context";
import { GoogleSignInButton } from "./google-sign-in-button";
import { fetchAuthProviders } from "../infrastructure/auth-api";

const HIGHLIGHTS = [
  { icon: BarChart3, key: "app.login.highlight1" },
  { icon: ShieldCheck, key: "app.login.highlight2" },
  { icon: Sparkles, key: "app.login.highlight3" },
];

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetchAuthProviders()
      .then((p) =>
        setGoogleEnabled(
          p.oauth.some((o) => o.provider === "google" && o.enabled)
        )
      )
      .catch(() => setGoogleEnabled(false));
  }, []);

  useEffect(() => {
    if (auth.status === "authenticated") void navigate({ to: "/login" });
  }, [auth.status, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await auth.login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-background">
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-brand p-12 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-black/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Leaf className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <div className="text-lg font-extrabold">Evalúa</div>
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
              {t("app.login.tagline")}
            </div>
          </div>
        </div>
        <div className="relative max-w-lg space-y-8">
          <h2 className="text-4xl font-extrabold leading-tight">
            {t("app.login.headline")}
          </h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3 text-white/85">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[15px] leading-relaxed">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Evalúa
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
              <Leaf className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-extrabold">Evalúa</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t("app.login.welcome")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("app.login.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("app.login.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t("app.login.emailPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("app.login.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="rounded-xl bg-danger/8 px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? t("app.login.submitting") : t("app.login.submit")}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {googleEnabled && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                {t("app.login.orContinueWith")}
                <span className="h-px flex-1 bg-border" />
              </div>
              <GoogleSignInButton onError={setError} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
