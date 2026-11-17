import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { fetchAssessmentProfiles } from "@/modules/assessment-core/infrastructure/assessment-api";
import { useTranslation } from "@/shared/i18n/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
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
  setViewerVisibility,
  type OrganisationUser,
  type ViewerVisibility,
} from "../../infrastructure/users-api";

export function viewerVisibilityOf(
  user: OrganisationUser
): ViewerVisibility | undefined {
  return user.roles.find((r) => r.code === "assessment_viewer")?.visibility;
}

/** Texto corto de lo que ve un visualizador, para la tabla de usuarios. */
export function useVisibilitySummary() {
  const { t } = useTranslation();
  return (visibility: ViewerVisibility | undefined) => {
    if (visibility?.allProfiles) return t("app.users.visibilityAll");
    const count = visibility?.profileIds.length ?? 0;
    return count === 0
      ? t("app.users.visibilityNone")
      : t("app.users.visibilitySome", { count });
  };
}

// Un administrador (o el superadministrador dueño del proyecto) decide qué
// organizaciones evaluadas ve cada visualizador: todas las del proyecto,
// incluidas las que se registren después, o una lista concreta.
export function ViewerVisibilityDialog({
  org,
  user,
  onOpenChange,
  onSaved,
}: {
  org: string;
  user: OrganisationUser | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const open = user !== null;
  const profilesQuery = useQuery({
    queryKey: ["visibility-profiles", org],
    queryFn: () => fetchAssessmentProfiles(org),
    enabled: open,
  });
  const profiles = useMemo(
    () =>
      [...(profilesQuery.data ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [profilesQuery.data]
  );

  const [allProfiles, setAllProfiles] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const current = viewerVisibilityOf(user);
    setAllProfiles(current?.allProfiles ?? false);
    setSelected(new Set(current?.profileIds ?? []));
    setSearch("");
  }, [user]);

  const visible = profiles.filter((p) =>
    `${p.name} ${p.country} ${p.region ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const save = useMutation({
    mutationFn: () =>
      setViewerVisibility(org, user!.id, {
        allProfiles,
        profileIds: allProfiles ? [] : [...selected],
      }),
    onSuccess: () => {
      toast({ title: t("app.users.visibilitySaved"), variant: "success" });
      onSaved();
    },
    onError: (err) =>
      toast({
        title: t("app.common.error"),
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      }),
  });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Eye className="h-5 w-5 text-brand" />
            {t("app.users.visibilityTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("app.users.visibilityDescription", {
              email: user?.email ?? "",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
              allProfiles
                ? "border-brand/50 bg-brand/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[hsl(var(--brand))]"
              checked={allProfiles}
              onChange={(e) => setAllProfiles(e.target.checked)}
            />
            <span>
              <span className="block text-sm font-bold">
                {t("app.users.visibilityAllOption")}
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                {t("app.users.visibilityAllHelp")}
              </span>
            </span>
          </label>

          {!allProfiles && (
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("app.users.visibilitySearch")}
                  aria-label={t("app.users.visibilitySearch")}
                />
              </div>
              <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-xl border p-2">
                {profilesQuery.isLoading ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("app.users.loading")}
                  </p>
                ) : visible.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {profiles.length === 0
                      ? t("app.users.visibilityNoProfiles")
                      : t("app.users.visibilityNoMatches")}
                  </p>
                ) : (
                  visible.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[hsl(var(--brand))]"
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p.id)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {p.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {[p.country, p.region].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("app.users.visibilitySelected", { count: selected.size })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("app.common.cancel")}
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? t("app.users.saving") : t("app.users.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
