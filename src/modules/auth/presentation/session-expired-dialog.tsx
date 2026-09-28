import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useTranslation } from "@/shared/i18n/i18n";

interface SessionExpiredDialogProps {
  email: string;
  onResume: (password: string) => Promise<void>;
  onLogout: () => void;
}

/**
 * La sesión caducó estando dentro de la aplicación. En vez de mandar al
 * usuario a la pantalla de acceso —lo que desmonta todo y se lleva por
 * delante el formulario a medio llenar—, se bloquea la pantalla con este
 * diálogo: se escribe la contraseña y se sigue exactamente donde se estaba.
 *
 * No se puede cerrar con Escape ni clicando fuera: mientras la sesión no se
 * reanude, cualquier cosa que se intente guardar fallaría.
 */
export function SessionExpiredDialog({
  email,
  onResume,
  onLogout,
}: SessionExpiredDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (password.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onResume(password);
      setPassword("");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("app.session.expiredFailed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(event) => {
          event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-deep">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <DialogTitle>{t("app.session.expiredTitle")}</DialogTitle>
          <DialogDescription>
            {t("app.session.expiredDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>{t("app.login.email")}</Label>
            <Input value={email} readOnly disabled className="mt-1" />
          </div>
          <div>
            <Label htmlFor="session-password">{t("app.login.password")}</Label>
            <Input
              id="session-password"
              type="password"
              autoFocus
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
              }}
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onLogout} disabled={submitting}>
            {t("app.session.expiredLogout")}
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={submitting || password.length === 0}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? t("app.session.expiredResuming")
              : t("app.session.expiredResume")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
