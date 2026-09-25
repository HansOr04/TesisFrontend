import { Link, useRouter } from "@tanstack/react-router";
import { AlertOctagon, Compass, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/shared/i18n/i18n";

// Pantalla de error de la aplicación (errorComponent por defecto del router).
export function AppErrorPage({
  error,
  reset,
}: {
  error: unknown;
  reset?: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="surface max-w-lg p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertOctagon className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">
          {t("app.errors.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("app.errors.description")}
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-muted p-3 text-left text-xs text-danger">
            {message}
          </pre>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => (reset ? reset() : router.invalidate())}
          >
            <RotateCcw className="h-4 w-4" /> {t("app.errors.retry")}
          </Button>
          <Button asChild>
            <Link to="/login">{t("app.errors.home")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="surface max-w-lg p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Compass className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">
          {t("app.errors.notFoundTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("app.errors.notFoundDescription")}
        </p>
        <Button className="mt-6" asChild>
          <Link to="/login">{t("app.errors.home")}</Link>
        </Button>
      </div>
    </div>
  );
}
