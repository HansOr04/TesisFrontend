import { useState } from "react";
import { Search } from "lucide-react";
import type { AssignableUser } from "@/modules/auth/infrastructure/organisations-api";
import { useTranslation } from "@/shared/i18n/i18n";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

/**
 * Buscador y lista de cuentas existentes para elegir una. Lo usan el equipo
 * del proyecto (asignar usuario) y el alta de proyecto (elegir administrador).
 */
export function AssignableUserList({
  users,
  loading,
  pickedId,
  onPick,
  name,
}: {
  users: AssignableUser[];
  loading: boolean;
  pickedId: string | null;
  onPick: (user: AssignableUser) => void;
  /** Nombre del grupo de radios; distinto por formulario. */
  name: string;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const visible = users.filter((u) =>
    `${u.name ?? ""} ${u.email}`.toLowerCase().includes(term)
  );

  return (
    <div>
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
      <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border bg-background p-2">
        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("app.users.loading")}
          </p>
        ) : visible.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("app.organisations.membersNoCandidates")}
          </p>
        ) : (
          visible.map((u) => (
            <label
              key={u.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2",
                pickedId === u.id ? "bg-brand/8" : "hover:bg-muted/50"
              )}
            >
              <input
                type="radio"
                name={name}
                className="accent-[hsl(var(--brand))]"
                checked={pickedId === u.id}
                onChange={() => onPick(u)}
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
  );
}
