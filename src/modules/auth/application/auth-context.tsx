import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthSession, AuthState } from "../domain/auth.types";
import {
  fetchMe,
  loginWithGoogle,
  loginWithPassword,
  logoutSession,
} from "../infrastructure/auth-api";
import { refreshAccessToken, sessionToken } from "@/shared/api/session-token";
import { fetchOrganisations } from "../infrastructure/organisations-api";
import { SessionExpiredDialog } from "@/modules/auth/presentation/session-expired-dialog";

const ORG_KEY = "assessment.currentOrganisation";

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  resumeSession: (password: string) => Promise<void>;
  setCurrentOrganisation: (organisation: string) => void;
  reloadProjects: () => Promise<void>;
  currentRoles: string[];
  canAdminister: boolean;
  isReadOnly: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function pickOrganisation(allowed: string[]): string {
  try {
    const stored = localStorage.getItem(ORG_KEY);
    if (stored && allowed.includes(stored)) return stored;
  } catch {}
  return allowed[0] ?? "";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    status: "loading",
    roles: [],
    isActuallySuperAdmin: false,
    ownedProjects: [],
    sessionExpired: false,
  });

  const hydrate = useCallback(async (token: string) => {
    const me = await fetchMe(token);
    const memberOf = me.organisations.map((o) => o.organisation);
    const ownedProjects = me.isSuperAdmin
      ? (await fetchOrganisations(token)).map((o) => o.id)
      : [];
    const allowed = [...new Set([...memberOf, ...ownedProjects])];
    setState({
      status: "authenticated",
      currentUser: {
        id: me.id,
        email: me.email,
        name: me.name,
        isSuperAdmin: me.isSuperAdmin,
        accessToken: token,
      },
      organisations: { allowed, current: pickOrganisation(allowed) },
      roles: me.organisations,
      isActuallySuperAdmin: me.isSuperAdmin,
      ownedProjects,
      sessionExpired: false,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    try {
      localStorage.removeItem("assessment.accessToken");
    } catch {}
    refreshAccessToken()
      .then((token) => {
        if (cancelled) return;
        if (!token) {
          setState((s) => ({ ...s, status: "anonymous" }));
          return;
        }
        return hydrate(token);
      })
      .catch(() => {
        if (cancelled) return;
        sessionToken.set(null);
        setState({
          status: "anonymous",
          roles: [],
          isActuallySuperAdmin: false,
          ownedProjects: [],
          sessionExpired: false,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  useEffect(
    () =>
      sessionToken.subscribe((token) => {
        setState((s) => {
          if (s.status !== "authenticated" || !s.currentUser) return s;
          if (!token) return { ...s, sessionExpired: true };
          return {
            ...s,
            sessionExpired: false,
            currentUser: { ...s.currentUser, accessToken: token },
          };
        });
      }),
    []
  );

  const applySession = useCallback(
    async (session: AuthSession) => {
      queryClient.clear();
      sessionToken.set(session.accessToken);
      await hydrate(session.accessToken);
    },
    [hydrate, queryClient]
  );

  const login = useCallback(
    async (email: string, password: string) =>
      applySession(await loginWithPassword(email, password)),
    [applySession]
  );

  const loginGoogle = useCallback(
    async (idToken: string) => applySession(await loginWithGoogle(idToken)),
    [applySession]
  );

  const resumeSession = useCallback(
    async (password: string) => {
      const email = state.currentUser?.email;
      if (!email) return;
      const session = await loginWithPassword(email, password);
      sessionToken.set(session.accessToken);
      await hydrate(session.accessToken);
      await queryClient.invalidateQueries();
    },
    [state.currentUser?.email, hydrate, queryClient]
  );

  const logout = useCallback(() => {
    void logoutSession();
    sessionToken.set(null);
    queryClient.clear();
    setState({
      status: "anonymous",
      roles: [],
      isActuallySuperAdmin: false,
      ownedProjects: [],
      sessionExpired: false,
    });
  }, [queryClient]);

  const setCurrentOrganisation = useCallback((organisation: string) => {
    localStorage.setItem(ORG_KEY, organisation);
    setState((s) =>
      s.organisations
        ? { ...s, organisations: { ...s.organisations, current: organisation } }
        : s
    );
  }, []);

  const reloadProjects = useCallback(async () => {
    const token = sessionToken.get();
    if (token) await hydrate(token);
  }, [hydrate]);

  const value = useMemo<AuthContextValue>(() => {
    const currentRoles =
      state.roles.find((r) => r.organisation === state.organisations?.current)
        ?.roles ?? [];
    const canAdminister =
      currentRoles.includes("assessment_admin") ||
      (state.isActuallySuperAdmin &&
        state.ownedProjects.includes(state.organisations?.current ?? ""));
    return {
      ...state,
      login,
      loginGoogle,
      logout,
      resumeSession,
      setCurrentOrganisation,
      reloadProjects,
      currentRoles,
      canAdminister,
      isReadOnly:
        !canAdminister &&
        !currentRoles.includes("assessment_evaluator") &&
        currentRoles.includes("assessment_viewer"),
    };
  }, [
    state,
    login,
    loginGoogle,
    logout,
    resumeSession,
    setCurrentOrganisation,
    reloadProjects,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {state.status === "authenticated" && state.sessionExpired && (
        <SessionExpiredDialog
          email={state.currentUser?.email ?? ""}
          onResume={resumeSession}
          onLogout={logout}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
