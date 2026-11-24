import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { usersQueries } from "@/modules/auth/application/users-queries";
import {
  fetchAssignableUsers,
  type Organisation,
} from "@/modules/auth/infrastructure/organisations-api";
import {
  createOrganisationUser,
  removeOrganisationUser,
  setViewerVisibility,
  updateOrganisationUser,
  type AssessmentRoleCode,
  type OrganisationUser,
  type ViewerVisibility,
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
  NO_VISIBILITY,
  ViewerScopePicker,
  ViewerVisibilityDialog,
  normalizeVisibility,
  useVisibilitySummary,
  viewerVisibilityOf,
} from "../users/viewer-visibility-dialog";
import { AssignableUserList } from "./assignable-user-list";

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
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [role, setRole] = useState<AssessmentRoleCode | "">(
    "assessment_evaluator"
  );
  const [draft, setDraft] = useState({ email: "", name: "", password: "" });
  const [visibility, setVisibility] = useState<ViewerVisibility>(NO_VISIBILITY);
  const [visibilityFor, setVisibilityFor] = useState<OrganisationUser | null>(
    null
  );
  const visibilitySummary = useVisibilitySummary();

  useEffect(() => {
    if (!open) return;
    setMode("existing");
    setPickedId(null);
    setRole("assessment_evaluator");
    setDraft({ email: "", name: "", password: "" });
    setVisibility(NO_VISIBILITY);
  }, [open, org]);

  const memberIds = new Set(members.map((m) => m.id));
  const candidates = (directoryQuery.data ?? []).filter(
    (u) => !memberIds.has(u.id)
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
    mutationFn: async () => {
      let user: OrganisationUser;
      if (mode === "existing") {
        if (!picked) throw new Error(t("app.organisations.membersPickUser"));
        user = await createOrganisationUser(org!, {
          email: picked.email,
          name: picked.name ?? picked.email,
          roleCode: role || undefined,
        });
      } else {
        if (!draft.email.trim() || !draft.name.trim())
          throw new Error(t("app.users.validationRequired"));
        if (draft.password && draft.password.length < 8)
          throw new Error(t("app.users.validationPassword"));
        user = await createOrganisationUser(org!, {
          email: draft.email.trim(),
          name: draft.name.trim(),
          password: draft.password || undefined,
          roleCode: role || undefined,
        });
      }
      // Lo que ve el visualizador se marcó junto con el rol.
      if (role === "assessment_viewer")
        await setViewerVisibility(
          org!,
          user.id,
          normalizeVisibility(visibility)
        );
      return user;
    },
    onSuccess: async (user) => {
      toast({
        title: t("app.organisations.membersAdded", { email: user.email }),
        variant: "success",
      });
      setPickedId(null);
      setDraft({ email: "", name: "", password: "" });
      setVisibility(NO_VISIBILITY);
      await refresh();
    },
    onError: fail,
  });

  const changeRole = useMutation({
    mutationFn: (v: {
      user: OrganisationUser;
      role: AssessmentRoleCode | "";
    }) => updateOrganisationUser(org!, v.user.id, { roleCode: v.role || null }),
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
                <AssignableUserList
                  name="assignable-user"
                  users={candidates}
                  loading={directoryQuery.isLoading}
                  pickedId={pickedId}
                  onPick={(u) => setPickedId(u.id)}
                />
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
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
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
                  <RoleSelect
                    id="member-role"
                    value={role}
                    onChange={setRole}
                  />
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
            {role === "assessment_viewer" && org && (
              <div className="mt-4">
                <Label className={lbl}>{t("app.users.visibilityTitle")}</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("app.users.visibilityInline")}
                </p>
                <div className="mt-2">
                  <ViewerScopePicker
                    org={org}
                    value={visibility}
                    onChange={setVisibility}
                    listClassName="max-h-48"
                  />
                </div>
              </div>
            )}
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
