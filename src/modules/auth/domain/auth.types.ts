export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  accessToken: string;
}

export interface OrganisationAccess {
  allowed: string[];
  current: string;
}

export interface OrganisationRoles {
  organisation: string;
  roles: string[];
}

export interface AuthSession {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    isSuperAdmin: boolean;
    organisations: string[];
  };
}

export interface AuthState {
  status: "loading" | "anonymous" | "authenticated";
  currentUser?: AuthenticatedUser;
  organisations?: OrganisationAccess;
  /** Roles de evaluación por organización (assessment_admin / assessment_evaluator). */
  roles: OrganisationRoles[];
  /** true si el usuario real es superadmin global. */
  isActuallySuperAdmin: boolean;
}
