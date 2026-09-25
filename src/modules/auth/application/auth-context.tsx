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

const ORG_KEY = "assessment.currentOrganisation";

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  setCurrentOrganisation: (organisation: string) => void;
  /** Roles del usuario en la organización actual. */
  currentRoles: string[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

function pickOrganisation(allowed: string[]): string {
  try {
    const stored = localStorage.getItem(ORG_KEY);
    if (stored && allowed.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return allowed[0] ?? "";
}

// Fuente única de verdad de la sesión: token de acceso corto en memoria
// (renovado con la cookie HttpOnly de refresh) + perfil (/auth/me). Expone la
// misma forma que usan las páginas (currentUser.accessToken,
// organisations.current, isActuallySuperAdmin).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    roles: [],
    isActuallySuperAdmin: false,
  });

  const hydrate = useCallback(async (token: string) => {
    const me = await fetchMe(token);
    const allowed = me.organisations.map((o) => o.organisation);
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
    });
  }, []);

  // Al cargar: intenta renovar con la cookie; sin cookie → anónimo.
  useEffect(() => {
    let cancelled = false;
    try {
      // Versiones anteriores guardaban el JWT en localStorage.
      localStorage.removeItem("assessment.accessToken");
    } catch {
      /* ignore */
    }
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
        });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  // Cada renovación silenciosa actualiza el token que ven las páginas (y el
  // socket de tiempo real); si la renovación falla, la sesión se cierra.
  useEffect(
    () =>
      sessionToken.subscribe((token) => {
        setState((s) => {
          if (s.status !== "authenticated" || !s.currentUser) return s;
          if (!token) {
            return {
              status: "anonymous",
              roles: [],
              isActuallySuperAdmin: false,
            };
          }
          return {
            ...s,
            currentUser: { ...s.currentUser, accessToken: token },
          };
        });
      }),
    []
  );

  const applySession = useCallback(
    async (session: AuthSession) => {
      sessionToken.set(session.accessToken);
      await hydrate(session.accessToken);
    },
    [hydrate]
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

  const logout = useCallback(() => {
    void logoutSession();
    sessionToken.set(null);
    setState({ status: "anonymous", roles: [], isActuallySuperAdmin: false });
  }, []);

  const setCurrentOrganisation = useCallback((organisation: string) => {
    localStorage.setItem(ORG_KEY, organisation);
    setState((s) =>
      s.organisations
        ? { ...s, organisations: { ...s.organisations, current: organisation } }
        : s
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      loginGoogle,
      logout,
      setCurrentOrganisation,
      currentRoles:
        state.roles.find((r) => r.organisation === state.organisations?.current)
          ?.roles ?? [],
    }),
    [state, login, loginGoogle, logout, setCurrentOrganisation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
