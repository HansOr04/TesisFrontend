import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, Pencil, Plus, RefreshCw, Users } from "lucide-react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { organisationsQueries } from "@/modules/auth/application/organisations-queries";
import {
  createOrganisation,
  fetchAssignableUsers,
  provisionOrganisation,
  updateOrganisation,
  type CreateOrganisationInput,
  type Organisation,
} from "@/modules/auth/infrastructure/organisations-api";
import { useTranslation } from "@/shared/i18n/i18n";
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
import { ProjectMembersDialog } from "./project-members-dialog";
import { AssignableUserList } from "./assignable-user-list";

type AdminMode = "me" | "existing" | "new";

const SLUG = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function OrganisationsPage() {
  const auth = useAuth();
  const { t, tr } = useTranslation();
  const queryClient = useQueryClient();
  const isSuperAdmin = auth.isActuallySuperAdmin;

  const list = useQuery(organisationsQueries.list(isSuperAdmin));
  const organisations = list.data ?? [];

  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Organisation | null>(null);
  const [membersOf, setMembersOf] = useState<Organisation | null>(null);

  const reprovision = useMutation({
    mutationFn: (id: string) => provisionOrganisation(id),
    onSuccess: (result, id) => {
      void organisationsQueries.invalidate(queryClient);
      toast({
        title: t("app.organisations.provisioned"),
        description: t("app.organisations.provisionedDetail", {
          org: id,
          kpi: result.templates.reduce((sum, x) => sum + x.indicators, 0),
        }),
        variant: "success",
      });
    },
    onError: (err) =>
      toast({
        title: t("app.common.error"),
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      }),
  });

  if (!isSuperAdmin) {
    return (
      <div className="surface p-8 text-center text-muted-foreground">
        {t("app.organisations.onlySuperAdmin")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <PageTitle rawTitle={t("app.organisations.title")} />
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {t("app.organisations.intro")}
          </p>
        </div>
        <Button size="lg" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> {t("app.organisations.new")}
        </Button>
      </div>

      <div className="surface overflow-x-auto">
        {list.isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t("app.organisations.loading")}
          </p>
        ) : (
          <table className="w-full text-[15px]">
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  {t("app.organisations.colOrganisation")}
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  {t("app.organisations.colMembers")}
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  {t("app.organisations.colProfiles")}
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  {t("app.organisations.colEvaluations")}
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  {t("app.organisations.colTemplates")}
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  {t("app.organisations.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {organisations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    {t("app.organisations.empty")}
                  </td>
                </tr>
              )}
              {organisations.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-deep">
                        <Globe className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold">{o.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {o.id}
                          {o.id === auth.organisations?.current && (
                            <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 font-sans text-[11px] font-semibold">
                              {t("app.organisations.currentBadge")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {o.members}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {o.profiles}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {o.evaluations}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    <span
                      className={
                        o.templates < 3 ? "font-bold text-warning" : undefined
                      }
                    >
                      {o.templates}/3
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMembersOf(o)}
                      >
                        <Users className="h-4 w-4" />{" "}
                        {t("app.organisations.members")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(o)}
                      >
                        <Pencil className="h-4 w-4" />{" "}
                        {t("app.organisations.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("app.organisations.reprovision")}
                        disabled={reprovision.isPending}
                        onClick={() => reprovision.mutate(o.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="surface p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand" />
          <h3 className="text-base font-extrabold">
            {t("app.organisations.noteTitle")}
          </h3>
        </div>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {tr("app.organisations.noteBody")}
        </p>
      </div>

      <OrganisationFormDialog
        open={showNew}
        onOpenChange={setShowNew}
        onCreated={(created) => {
          setShowNew(false);
          void organisationsQueries.invalidate(queryClient);
          setMembersOf(created);
        }}
      />
      <ProjectMembersDialog
        organisation={membersOf}
        onOpenChange={(open) => {
          if (!open) setMembersOf(null);
        }}
        onChanged={() => void organisationsQueries.invalidate(queryClient)}
      />
      <RenameDialog
        organisation={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={() => {
          setEditing(null);
          void organisationsQueries.invalidate(queryClient);
        }}
      />
    </div>
  );
}

function OrganisationFormDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (organisation: Organisation) => void;
}) {
  const { t } = useTranslation();
  const auth = useAuth();
  const [v, setV] = useState<CreateOrganisationInput>({ id: "", name: "" });
  const [idTouched, setIdTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState<AdminMode>("me");
  const [adminPicked, setAdminPicked] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const directoryQuery = useQuery({
    queryKey: ["assignable-users"],
    queryFn: () => fetchAssignableUsers(),
    enabled: open && adminMode === "existing",
    staleTime: 30 * 1000,
  });
  const directory = (directoryQuery.data ?? []).filter(
    (u) => u.id !== auth.currentUser?.id
  );

  const reset = () => {
    setV({ id: "", name: "" });
    setIdTouched(false);
    setError(null);
    setAdminMode("me");
    setAdminPicked(null);
  };

  const idValue = idTouched ? v.id : slugify(v.name);

  const adminInput = (): Pick<
    CreateOrganisationInput,
    "adminEmail" | "adminName" | "adminPassword"
  > => {
    if (adminMode === "existing") return { adminEmail: adminPicked?.email };
    if (adminMode === "new")
      return {
        adminEmail: v.adminEmail?.trim() || undefined,
        adminName: v.adminName?.trim() || undefined,
        adminPassword: v.adminPassword || undefined,
      };
    return {};
  };

  const create = useMutation({
    mutationFn: () =>
      createOrganisation({
        id: idValue.trim(),
        name: v.name.trim(),
        ...adminInput(),
      }),
    onSuccess: (result) => {
      toast({
        title: t("app.organisations.created"),
        description: t("app.organisations.createdDetail", {
          name: result.organisation.name,
          kpi: result.templates.reduce((sum, x) => sum + x.indicators, 0),
          admin: result.admin.email,
        }),
        variant: "success",
      });
      reset();
      onCreated(result.organisation);
      void auth.reloadProjects();
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : t("app.common.error")),
  });

  const adminValid =
    adminMode === "me" ||
    (adminMode === "existing" && adminPicked !== null) ||
    (adminMode === "new" &&
      /^\S+@\S+\.\S+$/.test(v.adminEmail?.trim() ?? "") &&
      (v.adminPassword?.length ?? 0) >= 8);
  const valid =
    v.name.trim().length >= 2 &&
    idValue.length >= 3 &&
    SLUG.test(idValue) &&
    adminValid;
  const lbl = "text-xs font-bold uppercase tracking-wide text-muted-foreground";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {t("app.organisations.new")}
          </DialogTitle>
          <DialogDescription>
            {t("app.organisations.newDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className={lbl} htmlFor="org-name">
              {t("app.organisations.name")}
            </Label>
            <Input
              id="org-name"
              className="mt-1.5"
              value={v.name}
              onChange={(e) => setV({ ...v, name: e.target.value })}
              placeholder={t("app.organisations.namePlaceholder")}
            />
          </div>
          <div>
            <Label className={lbl} htmlFor="org-id">
              {t("app.organisations.identifier")}
            </Label>
            <Input
              id="org-id"
              className="mt-1.5 font-mono"
              value={idValue}
              onChange={(e) => {
                setIdTouched(true);
                setV({ ...v, id: e.target.value.toLowerCase() });
              }}
              placeholder="mi-organizacion"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t("app.organisations.identifierHelp", {
                url: `/${idValue || "mi-organizacion"}/assessments/...`,
              })}
            </p>
          </div>

          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-sm font-bold">
              {t("app.organisations.adminTitle")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["me", "existing", "new"] as const).map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={adminMode === m ? "default" : "outline"}
                  onClick={() => {
                    setAdminMode(m);
                    setError(null);
                  }}
                >
                  {t(
                    m === "me"
                      ? "app.organisations.adminMe"
                      : m === "existing"
                        ? "app.organisations.membersExisting"
                        : "app.organisations.membersNew"
                  )}
                </Button>
              ))}
            </div>

            {adminMode === "me" && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("app.organisations.adminMeHelp", {
                  email: auth.currentUser?.email ?? "",
                })}
              </p>
            )}

            {adminMode === "existing" && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  {t("app.organisations.adminExistingHelp")}
                </p>
                <AssignableUserList
                  name="project-admin"
                  users={directory}
                  loading={directoryQuery.isLoading}
                  pickedId={adminPicked?.id ?? null}
                  onPick={(u) => setAdminPicked({ id: u.id, email: u.email })}
                />
              </div>
            )}

            {adminMode === "new" && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-muted-foreground">
                  {t("app.organisations.adminNewHelp")}
                </p>
                <div>
                  <Label className={lbl} htmlFor="org-admin-email">
                    {t("app.organisations.adminEmail")}
                  </Label>
                  <Input
                    id="org-admin-email"
                    type="email"
                    className="mt-1.5"
                    value={v.adminEmail ?? ""}
                    onChange={(e) => setV({ ...v, adminEmail: e.target.value })}
                    placeholder={t("app.users.emailPlaceholder")}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className={lbl} htmlFor="org-admin-name">
                      {t("app.organisations.adminName")}
                    </Label>
                    <Input
                      id="org-admin-name"
                      className="mt-1.5"
                      value={v.adminName ?? ""}
                      onChange={(e) =>
                        setV({ ...v, adminName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className={lbl} htmlFor="org-admin-password">
                      {t("app.organisations.adminPassword")}
                    </Label>
                    <Input
                      id="org-admin-password"
                      type="password"
                      autoComplete="new-password"
                      className="mt-1.5"
                      value={v.adminPassword ?? ""}
                      onChange={(e) =>
                        setV({ ...v, adminPassword: e.target.value })
                      }
                      placeholder={t("app.organisations.adminPasswordHint")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

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
          <Button
            onClick={() => {
              setError(null);
              create.mutate();
            }}
            disabled={!valid || create.isPending}
          >
            {create.isPending
              ? t("app.organisations.creating")
              : t("app.organisations.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameDialog({
  organisation,
  onOpenChange,
  onSaved,
}: {
  organisation: Organisation | null;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [dirty, setDirty] = useState(false);
  const value = dirty ? name : (organisation?.name ?? "");

  const save = useMutation({
    mutationFn: () =>
      updateOrganisation(organisation!.id, { name: value.trim() }),
    onSuccess: () => {
      setDirty(false);
      toast({ title: t("app.organisations.updated"), variant: "success" });
      onSaved();
    },
    onError: (err) =>
      toast({
        title: t("app.common.error"),
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      }),
  });

  const lbl = "text-xs font-bold uppercase tracking-wide text-muted-foreground";
  return (
    <Dialog
      open={organisation !== null}
      onOpenChange={(o) => {
        if (!o) setDirty(false);
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {t("app.organisations.editTitle")}
          </DialogTitle>
          <DialogDescription>{organisation?.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className={lbl} htmlFor="org-rename">
              {t("app.organisations.name")}
            </Label>
            <Input
              id="org-rename"
              className="mt-1.5"
              value={value}
              onChange={(e) => {
                setDirty(true);
                setName(e.target.value);
              }}
            />
          </div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            {t("app.organisations.identifierLocked")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("app.common.cancel")}
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={value.trim().length < 2 || save.isPending}
          >
            {save.isPending
              ? t("app.organisations.saving")
              : t("app.organisations.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
