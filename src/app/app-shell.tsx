import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  ChevronDown,
  Globe,
  LayoutGrid,
  Leaf,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { cn } from "@/shared/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "organizational" | "capacity" | "risk";
  superAdminOnly?: boolean;
  adminOnly?: boolean;
  exact?: boolean;
}

const TONE_DOT: Record<NonNullable<NavItem["tone"]>, string> = {
  organizational: "bg-tool-organizational",
  capacity: "bg-tool-capacity",
  risk: "bg-tool-risk",
};

// Layout autenticado: sidebar oscuro con la marca, navegación por secciones
// (cada herramienta con su color) y barra superior con organización, idioma
// y usuario. Las páginas se renderizan en <Outlet />.
export function AppShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const main: NavItem[] = [
    {
      to: "/assessments",
      label: t("app.layout.pages.assessment"),
      icon: LayoutGrid,
      exact: true,
    },
    {
      to: "/assessments/dashboard",
      label: t("app.layout.pages.assessmentDashboard"),
      icon: BarChart3,
    },
  ];
  const tools: NavItem[] = [
    {
      to: "/assessments/organizational",
      label: t("app.layout.pages.organizationalTool"),
      icon: Building2,
      tone: "organizational",
    },
  ];
  const admin: NavItem[] = [];

  const current =
    [...tools, ...admin, ...main].find((i) =>
      i.exact
        ? pathname === i.to || pathname === i.to + "/"
        : pathname.startsWith(i.to)
    ) ?? main[0];

  const initials = (auth.currentUser?.name ?? auth.currentUser?.email ?? "?")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    auth.logout();
    void navigate({ to: "/login" });
  };

  const renderItem = (item: NavItem) => (
    <Link
      key={item.to}
      to={item.to}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-white/65 transition-colors hover:bg-white/8 hover:text-white"
      activeProps={{ className: cn("bg-white/12 text-white shadow-inner") }}
      activeOptions={{ exact: item.exact }}
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/6 group-hover:bg-white/10">
        <item.icon className="h-4 w-4" />
        {item.tone && (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-[#122a22]",
              TONE_DOT[item.tone]
            )}
          />
        )}
      </span>
      {item.label}
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Barra lateral: fija en escritorio, panel deslizante en móvil */}
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("app.shell.closeMenu")}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "bg-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[264px] shrink-0 flex-col transition-transform md:sticky md:top-0 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label={t("app.shell.mainNav")}
      >
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <button
            type="button"
            aria-label={t("app.shell.closeMenu")}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-lg shadow-black/30">
            <Leaf className="h-5 w-5 text-white" />
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold text-white">Evalúa</div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
              {t("app.login.tagline")}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">{main.map(renderItem)}</div>
          <div>
            <div className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/35">
              {t("app.shell.tools")}
            </div>
            <div className="space-y-1">{tools.map(renderItem)}</div>
          </div>
          {(auth.isActuallySuperAdmin ||
            auth.currentRoles.includes("assessment_admin")) && (
            <div>
              <div className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/35">
                {t("app.shell.admin")}
              </div>
              <div className="space-y-1">
                {admin
                  .filter(
                    (i) =>
                      (!i.superAdminOnly || auth.isActuallySuperAdmin) &&
                      (!i.adminOnly ||
                        auth.isActuallySuperAdmin ||
                        auth.currentRoles.includes("assessment_admin"))
                  )
                  .map(renderItem)}
              </div>
            </div>
          )}
        </nav>

        <div className="m-3 rounded-2xl bg-white/6 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-semibold text-white">
                {auth.currentUser?.name ?? auth.currentUser?.email}
              </div>
              <div className="truncate text-[11px] text-white/50">
                {auth.currentRoles.length > 0
                  ? auth.currentRoles
                      .map((r) => r.replace("assessment_", ""))
                      .join(", ")
                  : auth.isActuallySuperAdmin
                    ? "superadmin"
                    : "usuario"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title={t("app.shell.logout")}
              className="rounded-lg p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/70 bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              type="button"
              aria-label={
                mobileOpen ? t("app.shell.closeMenu") : t("app.shell.openMenu")
              }
              className="mr-1 rounded-xl border border-border bg-card p-2 text-foreground shadow-sm md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <span className="hidden sm:inline">Evalúa</span>
            <span className="hidden sm:inline text-border">/</span>
            <span className="font-semibold text-foreground">
              {current.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {auth.organisations && auth.organisations.allowed.length > 0 && (
              <label className="relative flex items-center">
                <Globe className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <select
                  className="h-9 appearance-none rounded-xl border border-border bg-card pl-9 pr-8 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={auth.organisations.current}
                  onChange={(e) => auth.setCurrentOrganisation(e.target.value)}
                  title={t("app.shell.organisation")}
                >
                  {auth.organisations.allowed.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
              </label>
            )}
            <button
              type="button"
              onClick={() => setLocale(locale === "es" ? "en" : "es")}
              className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-bold tracking-wide text-muted-foreground shadow-sm hover:text-brand-deep"
              title={t("app.shell.language")}
              aria-label={t("app.shell.language")}
            >
              {locale.toUpperCase()}
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-6 animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
