import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  KeyRound,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { usersQueries } from "@/modules/auth/application/users-queries";
import { useTranslation } from "@/shared/i18n/i18n";
import { useAuth } from "@/modules/auth/application/auth-context";
import { PageTitle } from "@/shared/components/page-title";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/use-toast";
import { cn } from "@/shared/lib/utils";
import {
  createOrganisationUser,
  removeOrganisationUser,
  updateOrganisationUser,
  type AssessmentRoleCode,
  type OrganisationUser,
} from "../../infrastructure/users-api";

// Etiquetas y descripciones vienen del diccionario (app.users.role*).
const ROLE_OPTIONS: {
  code: AssessmentRoleCode | "";
  label: string;
  description: string;
}[] = [
  {
    code: "assessment_evaluator",
    label: "app.users.roleEvaluator",
    description: "app.users.roleEvaluatorDescription",
  },
  {
    code: "assessment_admin",
    label: "app.users.roleAdmin",
    description: "app.users.roleAdminDescription",
  },
  {
    code: "",
    label: "app.users.roleNone",
    description: "app.users.roleNoneDescription",
  },
];

function roleOf(u: OrganisationUser): AssessmentRoleCode | "" {
  return (u.roles[0]?.code as AssessmentRoleCode | undefined) ?? "";
}

// Administración de usuarios y permisos de la organización actual.
export function UsersPage() {
  const auth = useAuth();
  const { t, tr } = useTranslation();
  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;
  const queryClient = useQueryClient();
  const usersQuery = useQuery(usersQueries.list(org));
  const users = useMemo<OrganisationUser[]>(
    () => usersQuery.data ?? [],
    [usersQuery.data]
  );
  const loading = usersQuery.isLoading;
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<OrganisationUser | null>(null);
  const [passwordFor, setPasswordFor] = useState<OrganisationUser | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!org) return;
    await usersQueries.invalidate(queryClient, org);
  }, [queryClient, org]);

  const counts = useMemo(
    () => ({
      admins: users.filter((u) => roleOf(u) === "assessment_admin").length,
      evaluators: users.filter((u) => roleOf(u) === "assessment_evaluator")
        .length,
      inactive: users.filter((u) => !u.isActive).length,
    }),
    [users]
  );

  const run = async (fn: () => Promise<unknown>, success: string) => {
    if (!org || !token) return;
    setSaving(true);
    try {
      await fn();
      toast({
        title: t("app.users.done"),
        description: success,
        variant: "success",
      });
      await load();
      return true;
    } catch (err) {
      toast({
        title: t("app.common.error"),
        description: err instanceof Error ? err.message : t("app.users.failed"),
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <PageTitle rawTitle={t("app.users.title")} />
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {tr("app.users.intro", { org: org ?? "" })}
          </p>
        </div>
        <Button size="lg" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> {t("app.users.new")}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: t("app.users.statUsers"),
            value: users.length,
            icon: Users,
            tone: "bg-brand/8 text-brand-deep",
          },
          {
            label: t("app.users.statAdmins"),
            value: counts.admins,
            icon: ShieldCheck,
            tone: "bg-success/12 text-success",
          },
          {
            label: t("app.users.statEvaluators"),
            value: counts.evaluators,
            icon: Shield,
            tone: "bg-[#1D8FBF]/10 text-[#1D8FBF]",
          },
          {
            label: t("app.users.statInactive"),
            value: counts.inactive,
            icon: UserX,
            tone: "bg-muted text-muted-foreground",
          },
        ].map((s) => (
          <div key={s.label} className="surface flex items-center gap-4 p-5">
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                s.tone
              )}
            >
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-3xl font-extrabold tabular-nums">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="surface p-6">
        <h3 className="text-lg font-extrabold">{t("app.users.rolesTitle")}</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLE_OPTIONS.map((r) => (
            <div key={r.code} className="rounded-2xl bg-muted/50 p-5">
              <div className="text-base font-bold">{t(r.label)}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(r.description)}
              </p>
            </div>
          ))}
        </div>
        {auth.isActuallySuperAdmin && (
          <p className="mt-4 text-sm text-muted-foreground">
            {tr("app.users.superAdminNote")}
          </p>
        )}
      </div>

      <div className="surface overflow-x-auto">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t("app.users.loading")}
          </p>
        ) : (
          <table className="w-full text-[15px]">
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  {t("app.users.colUser")}
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  {t("app.users.colRole")}
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  {t("app.users.colAccess")}
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  {t("app.users.colStatus")}
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  {t("app.users.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const role = roleOf(u);
                const isMe = u.id === auth.currentUser?.id;
                return (
                  <tr
                    key={u.id}
                    className={cn("border-t", !u.isActive && "opacity-60")}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                          {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-semibold">
                            {u.name ?? "—"}{" "}
                            {isMe && (
                              <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                {t("app.users.you")}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.isSuperAdmin && (
                          <span className="rounded-lg bg-warning/15 px-2 py-1 text-xs font-bold text-warning">
                            Superadmin
                          </span>
                        )}
                        <span
                          className={cn(
                            "rounded-lg px-2 py-1 text-xs font-bold",
                            role === "assessment_admin"
                              ? "bg-success/12 text-success"
                              : role === "assessment_evaluator"
                                ? "bg-[#1D8FBF]/10 text-[#1D8FBF]"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {ROLE_OPTIONS.find((r) => r.code === role)?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {[
                        u.hasPassword && t("app.users.credentialPassword"),
                        u.oauthProvider && `Google`,
                      ]
                        .filter(Boolean)
                        .join(" · ") || t("app.users.noCredentials")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-sm font-semibold",
                          u.isActive ? "text-success" : "text-muted-foreground"
                        )}
                      >
                        {u.isActive ? (
                          <UserCheck className="h-4 w-4" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                        {u.isActive
                          ? t("app.users.active")
                          : t("app.users.inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(u)}
                        >
                          {t("app.users.edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title={t("app.users.changePassword")}
                          onClick={() => setPasswordFor(u)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        {!isMe && (
                          <Button
                            variant="outline"
                            size="sm"
                            title={
                              u.isActive
                                ? t("app.users.deactivate")
                                : t("app.users.activate")
                            }
                            disabled={saving}
                            onClick={() =>
                              void run(
                                () =>
                                  updateOrganisationUser(
                                    org!,
                                    u.id,
                                    { isActive: !u.isActive },
                                    token
                                  ),
                                u.isActive
                                  ? t("app.users.deactivated")
                                  : t("app.users.activated")
                              )
                            }
                          >
                            {u.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {!isMe && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-danger hover:border-danger/40 hover:bg-danger/5 hover:text-danger"
                            title={t("app.users.remove")}
                            disabled={saving}
                            onClick={() => {
                              if (
                                window.confirm(
                                  t("app.users.removeConfirm", {
                                    email: u.email,
                                    org: org ?? "",
                                  })
                                )
                              )
                                void run(
                                  () =>
                                    removeOrganisationUser(org!, u.id, token),
                                  t("app.users.removed")
                                );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <UserFormDialog
        open={showNew}
        onOpenChange={setShowNew}
        title={t("app.users.new")}
        canGrantSuperAdmin={auth.isActuallySuperAdmin}
        saving={saving}
        onSubmit={async (v) => {
          const ok = await run(
            () =>
              createOrganisationUser(
                org!,
                {
                  email: v.email,
                  name: v.name,
                  password: v.password || undefined,
                  roleCode: v.roleCode || undefined,
                  isSuperAdmin: v.isSuperAdmin || undefined,
                },
                token
              ),
            t("app.users.created", { email: v.email })
          );
          if (ok) setShowNew(false);
        }}
      />
      <UserFormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={t("app.users.editTitle", { email: editing?.email ?? "" })}
        initial={
          editing
            ? {
                email: editing.email,
                name: editing.name ?? "",
                password: "",
                roleCode: roleOf(editing),
                isSuperAdmin: editing.isSuperAdmin,
              }
            : undefined
        }
        editMode
        canGrantSuperAdmin={
          auth.isActuallySuperAdmin && editing?.id !== auth.currentUser?.id
        }
        saving={saving}
        onSubmit={async (v) => {
          if (!editing) return;
          const ok = await run(
            () =>
              updateOrganisationUser(
                org!,
                editing.id,
                {
                  name: v.name,
                  roleCode: v.roleCode || null,
                  ...(auth.isActuallySuperAdmin &&
                  editing.id !== auth.currentUser?.id
                    ? { isSuperAdmin: v.isSuperAdmin }
                    : {}),
                },
                token
              ),
            t("app.users.updated")
          );
          if (ok) setEditing(null);
        }}
      />
      <PasswordDialog
        user={passwordFor}
        onOpenChange={(o) => !o && setPasswordFor(null)}
        saving={saving}
        onSubmit={async (password) => {
          if (!passwordFor) return;
          const ok = await run(
            () =>
              updateOrganisationUser(org!, passwordFor.id, { password }, token),
            t("app.users.passwordUpdated")
          );
          if (ok) setPasswordFor(null);
        }}
      />
    </div>
  );
}

interface FormValues {
  email: string;
  name: string;
  password: string;
  roleCode: AssessmentRoleCode | "";
  isSuperAdmin: boolean;
}

function UserFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  editMode,
  canGrantSuperAdmin,
  saving,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial?: FormValues;
  editMode?: boolean;
  canGrantSuperAdmin: boolean;
  saving: boolean;
  onSubmit: (v: FormValues) => Promise<void>;
}) {
  const { t, tr } = useTranslation();
  const [v, setV] = useState<FormValues>({
    email: "",
    name: "",
    password: "",
    roleCode: "assessment_evaluator",
    isSuperAdmin: false,
  });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setV(
        initial ?? {
          email: "",
          name: "",
          password: "",
          roleCode: "assessment_evaluator",
          isSuperAdmin: false,
        }
      );
      setError(null);
    }
  }, [open, initial]);
  const submit = () => {
    if (!v.email.trim() || !v.name.trim())
      return setError(t("app.users.validationRequired"));
    if (!editMode && v.password && v.password.length < 8)
      return setError(t("app.users.validationPassword"));
    setError(null);
    void onSubmit(v);
  };
  const lbl = "text-xs font-bold uppercase tracking-wide text-muted-foreground";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{title}</DialogTitle>
          <DialogDescription>
            {editMode
              ? t("app.users.formEditDescription")
              : t("app.users.formCreateDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className={lbl}>{t("app.users.email")}</Label>
            <Input
              type="email"
              value={v.email}
              disabled={editMode}
              onChange={(e) => setV({ ...v, email: e.target.value })}
              className="mt-1.5"
              placeholder={t("app.users.emailPlaceholder")}
            />
          </div>
          <div>
            <Label className={lbl}>{t("app.users.name")}</Label>
            <Input
              value={v.name}
              onChange={(e) => setV({ ...v, name: e.target.value })}
              className="mt-1.5"
              placeholder={t("app.users.namePlaceholder")}
            />
          </div>
          {!editMode && (
            <div>
              <Label className={lbl}>{t("app.users.initialPassword")}</Label>
              <Input
                type="password"
                value={v.password}
                onChange={(e) => setV({ ...v, password: e.target.value })}
                className="mt-1.5"
                placeholder={t("app.users.passwordPlaceholder")}
              />
            </div>
          )}
          <div>
            <Label className={lbl}>{t("app.users.roleInOrganisation")}</Label>
            <div className="mt-2 space-y-2">
              {ROLE_OPTIONS.map((r) => (
                <label
                  key={r.code}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    v.roleCode === r.code
                      ? "border-brand/50 bg-brand/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    className="mt-1 accent-[hsl(var(--brand))]"
                    checked={v.roleCode === r.code}
                    onChange={() => setV({ ...v, roleCode: r.code })}
                  />
                  <span>
                    <span className="block text-sm font-bold">{r.label}</span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {r.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          {canGrantSuperAdmin && (
            <label className="flex items-center gap-3 rounded-xl bg-warning/8 p-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--warning))]"
                checked={v.isSuperAdmin}
                onChange={(e) => setV({ ...v, isSuperAdmin: e.target.checked })}
              />
              <span>{tr("app.users.superAdminOption")}</span>
            </label>
          )}
          {error && (
            <p className="rounded-xl bg-danger/8 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("app.common.cancel")}
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving
              ? t("app.users.saving")
              : editMode
                ? t("app.users.saveChanges")
                : t("app.users.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordDialog({
  user,
  onOpenChange,
  saving,
  onSubmit,
}: {
  user: OrganisationUser | null;
  onOpenChange: (o: boolean) => void;
  saving: boolean;
  onSubmit: (password: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  useEffect(() => {
    setPassword("");
    setConfirm("");
  }, [user]);
  const valid = password.length >= 8 && password === confirm;
  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {t("app.users.changePassword")}
          </DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t("app.users.newPassword")}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t("app.users.confirmPassword")}
            </Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5"
            />
          </div>
          {password && !valid && (
            <p className="text-sm text-danger">
              {password.length < 8
                ? t("app.users.passwordMin")
                : t("app.users.passwordMismatch")}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("app.common.cancel")}
          </Button>
          <Button
            disabled={!valid || saving}
            onClick={() => void onSubmit(password)}
          >
            {t("app.users.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
