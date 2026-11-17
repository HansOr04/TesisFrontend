import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { usersQueries } from "@/modules/auth/application/users-queries";
import {
  fetchAssignableUsers,
  type Organisation,
} from "@/modules/auth/infrastructure/organisations-api";
import {
  createOrganisationUser,
  removeOrganisationUser,
  updateOrganisationUser,
  type AssessmentRoleCode,
  type OrganisationUser,
} from "@/modules/auth/infrastructure/users-api";
import { useTranslation } from "@/shared/i18n/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/use-toast";
import { cn } from "@/shared/lib/utils";
import { ROLE_OPTIONS, roleOf, roleTone } from "../users/roles";
import {
  ViewerVisibilityDialog,
  useVisibilitySummary,
  viewerVisibilityOf,
} from "../users/viewer-visibility-dialog";

type Mode = "existing" | "new";

const lbl = "text-xs font-bold uppercase tracking-wide text-muted-foreground";

function RoleSelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: AssessmentRoleCode | "";
  onChange: (role: AssessmentRoleCode | "") => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <select
      id={id}
      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as AssessmentRoleCode | "")}
    >
      {ROLE_OPTIONS.map((r) => (
        <option key={r.code} value={r.code}>
          {t(r.label)}
        </option>
      ))}
    </select>
  );
}

// Desde «Gestión de proyectos» el superadministrador arma el equipo de cada
// proyecto que creó: asigna usuarios que ya existen en la plataforma, crea
// usuarios nuevos y, a los visualizadores, les habilita qué organizaciones
// evaluadas pueden ver.
export function ProjectMembersDialog({
  organisation,
  onOpenChange,
  onChanged,
}: {
  organisation: Organisation | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const org = organisation?.id;
  const open = organisation !== null;

  const membersQuery = useQuery({ ...usersQueries.list(org), enabled: open });
  const members = useMemo<OrganisationUser[]>(
    () => membersQuery.data ?? [],
    [membersQuery.data]
  );
  const directoryQuery = useQuery({
    queryKey: ["assignable-users"],
    queryFn: () => fetchAssignableUsers(),
    enabled: open,
    staleTime: 30 * 1000,
  });

  const [mode, setMode] = useState<Mode>("existing");
  const [search, setSearch] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [role, setRole] = useState<AssessmentRoleCode | "">(
    "assessment_evaluator"
  );
  const [draft, setDraft] = useState({ email: "", name: "", password: "" });
  const [visibilityFor, setVisibilityFor] = useState<OrganisationUser | null>(
    null
  );
  const visibilitySummary = useVisibilitySummary();

  useEffect(() => {
    if (!open) return;
    setMode("existing");
    setSearch("");
    setPickedId(null);
    setRole("assessment_evaluator");
    setDraft({ email: "", name: "", password: "" });
  }, [open, org]);

  const memberIds = new Set(members.map((m) => m.id));
  const candidates = (directoryQuery.data ?? []).filter(
    (u) =>
      !memberIds.has(u.id) &&
      `${u.name ?? ""} ${u.email}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );
  const picked = (directoryQuery.data ?? []).find((u) => u.id === pickedId);

  const refresh = async () => {
    if (!org) return;
    await usersQueries.invalidate(queryClient, org);
    await queryClient.invalidateQueries({ queryKey: ["assignable-users"] });
    onChanged();
  };

  const fail = (err: unknown) =>
    toast({
      title: t("app.common.error"),
      description: err instanceof Error ? err.message : t("app.users.failed"),
      variant: "destructive",
    });

  const add = useMutation({
    mutationFn: () => {
      if (mode === "existing") {
        if (!picked) throw new Error(t("app.organisations.membersPickUser"));
        return createOrganisationUser(org!, {
          email: picked.email,
          name: picked.name ?? picked.email,
          roleCode: role || undefined,
        });
      }
      if (!draft.email.trim() || !draft.name.trim())
        throw new Error(t("app.users.validationRequired"));
      if (draft.password && draft.password.length < 8)
        throw new Error(t("app.users.validationPassword"));
      return createOrganisationUser(org!, {
        email: draft.email.trim(),
        name: draft.name.trim(),
        password: draft.password || undefined,
        roleCode: role || undefined,
      });
    },
    onSuccess: async (user) => {
      toast({
        title: t("app.organisations.membersAdded", { email: user.email }),
        variant: "success",
      });
      setPickedId(null);
      setDraft({ email: "", name: "", password: "" });
      await refresh();
      if (role === "assessment_viewer") setVisibilityFor(user);
    },
    onError: fail,
  });

  const changeRole = useMutation({
    mutationFn: (v: { user: OrganisationUser; role: AssessmentRoleCode | "" }) =>
      updateOrganisationUser(org!, v.user.id, { roleCode: v.role || null }),
    onSuccess: async (user, v) => {
      toast({ title: t("app.users.updated"), variant: "success" });
      await refresh();
      if (v.role === "assessment_viewer") setVisibilityFor(user);
    },
    onError: fail,
  });

  const remove = useMutation({
    mutationFn: (user: OrganisationUser) =>
      removeOrganisationUser(org!, user.id),
    onSuccess: async () => {
      toast({ title: t("app.users.removed"), variant: "success" });
      await refresh();
    },
    onError: fail,
  });

  const busy = add.isPending || changeRole.isPending || remove.isPending;

  return (
    <>
      <Dialog open={open && visibilityFor === null} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
              <Users className="h-5 w-5 text-brand" />
              {t("app.organisations.membersTitle", {
                name: organisation?.name ?? "",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("app.organisations.membersDescription")}
            </DialogDescription>
          </DialogHeader>

          <section className="rounded-2xl border p-4">
            <div className="flex flex-wrap gap-2">
              {(["existing", "new"] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={mode === m ? "default" : "outline"}
                  onClick={() => setMode(m)}
                >
                  {m === "existing"
                    ? t("app.organisations.membersExisting")
                    : t("app.organisations.membersNew")}
                </Button>
              ))}
            </div>

            {mode === "existing" ? (
              <div className="mt-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("app.organisations.membersSearch")}
                    aria-label={t("app.organisations.membersSearch")}
                  />
                </div>
                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
                  {directoryQuery.isLoading ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {t("app.users.loading")}
                    </p>
                  ) : candidates.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {t("app.organisations.membersNoCandidates")}
                    </p>
                  ) : (
                    candidates.map((u) => (
                      <label
                        key={u.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2",
                          pickedId === u.id ? "bg-brand/8" : "hover:bg-muted/50"
                        )}
                      >
                        <input
                          type="radio"
                          name="assignable-user"
                          className="accent-[hsl(var(--brand))]"
                          checked={pickedId === u.id}
                          onChange={() => setPickedId(u.id)}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {u.name ?? u.email}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {u.email}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className={lbl} htmlFor="member-email">
                    {t("app.users.email")}
                  </Label>
                  <Input
                    id="member-email"
                    type="email"
                    className="mt-1.5"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft({ ...draft, email: e.target.value })
                    }
                    placeholder={t("app.users.emailPlaceholder")}
                  />
                </div>
                <div>
                  <Label className={lbl} htmlFor="member-name">
                    {t("app.users.name")}
                  </Label>
                  <Input
                    id="member-name"
                    className="mt-1.5"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder={t("app.users.namePlaceholder")}
                  />
                </div>
                <div>
                  <Label className={lbl} htmlFor="member-password">
                    {t("app.users.initialPassword")}
                  </Label>
                  <Input
                    id="member-password"
                    type="password"
                    className="mt-1.5"
                    value={draft.password}
                    onChange={(e) =>
                      setDraft({ ...draft, password: e.target.value })
                    }
                    placeholder={t("app.users.passwordPlaceholder")}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <Label className={lbl} htmlFor="member-role">
                  {t("app.users.roleInOrganisation")}
                </Label>
                <div className="mt-1.5">
                  <RoleSelect id="member-role" value={role} onChange={setRole} />
                </div>
              </div>
              <Button
                onClick={() => add.mutate()}
                disabled={busy || (mode === "existing" && !picked)}
              >
                <UserPlus className="h-4 w-4" />
                {mode === "existing"
                  ? t("app.organisations.membersAssign")
                  : t("app.users.create")}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t(
                ROLE_OPTIONS.find((r) => r.code === role)?.description ??
                  "app.users.roleNoneDescription"
              )}
            </p>
          </section>

          <section>
            <h3 className="text-base font-extrabold">
              {t("app.organisations.membersCurrent", { count: members.length })}
            </h3>
            {membersQuery.isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("app.users.loading")}
              </p>
            ) : members.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("app.organisations.membersEmpty")}
              </p>
            ) : (
              <ul className="mt-2 divide-y rounded-2xl border">
                {members.map((m) => {
                  const current = roleOf(m);
                  const isMe = m.id === auth.currentUser?.id;
                  return (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">
                          {m.name ?? m.email}
                          {isMe && (
                            <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                              {t("app.users.you")}
                            </span>
                          )}
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {m.email}
                        </div>
                        {current === "assessment_viewer" && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {visibilitySummary(viewerVisibilityOf(m))}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "rounded-lg px-2 py-1 text-xs font-bold",
                          roleTone(current)
                        )}
                      >
                        {t(
                          ROLE_OPTIONS.find((r) => r.code === current)?.label ??
                            "app.users.roleNone"
                        )}
                      </span>
                      <div className="w-44">
                        <RoleSelect
                          id={`role-${m.id}`}
                          value={current}
                          disabled={busy || isMe}
                          onChange={(r) =>
                            changeRole.mutate({ user: m, role: r })
                          }
                        />
                      </div>
                      {current === "assessment_viewer" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVisibilityFor(m)}
                        >
                          <Eye className="h-4 w-4" />{" "}
                          {t("app.users.visibilityAction")}
                        </Button>
                      )}
                      {!isMe && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-danger hover:border-danger/40 hover:bg-danger/5 hover:text-danger"
                          title={t("app.users.remove")}
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                t("app.users.removeConfirm", {
                                  email: m.email,
                                  org: organisation?.name ?? "",
                                })
                              )
                            )
                              remove.mutate(m);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </DialogContent>
      </Dialog>

      {org && (
        <ViewerVisibilityDialog
          org={org}
          user={visibilityFor}
          onOpenChange={(o) => !o && setVisibilityFor(null)}
          onSaved={() => {
            setVisibilityFor(null);
            void refresh();
          }}
        />
      )}
    </>
  );
}
