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
import { SessionExpiredDialog } from "@/modules/auth/presentation/session-expired-dialog";

const ORG_KEY = "assessment.currentOrganisation";

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  /** Reanuda la sesión caducada sin salir de la pantalla en la que se está. */
  resumeSession: (password: string) => Promise<void>;
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
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    status: "loading",
    roles: [],
    isActuallySuperAdmin: false,
    sessionExpired: false,
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
      sessionExpired: false,
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
          sessionExpired: false,
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
          // Antes se cerraba la sesión aquí mismo. Eso desmontaba la
          // aplicación y se perdía lo que hubiera en pantalla sin guardar;
          // ahora solo se marca como caducada y el diálogo pide la clave.
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

  // Reanudar no es volver a entrar: se conserva la organización actual y se
  // refrescan las consultas que hayan fallado mientras la sesión estaba caída.
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
    setState({
      status: "anonymous",
      roles: [],
      isActuallySuperAdmin: false,
      sessionExpired: false,
    });
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
      resumeSession,
      setCurrentOrganisation,
      currentRoles:
        state.roles.find((r) => r.organisation === state.organisations?.current)
          ?.roles ?? [],
    }),
    [state, login, loginGoogle, logout, resumeSession, setCurrentOrganisation]
  );

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
