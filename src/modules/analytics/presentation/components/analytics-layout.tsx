import { BookOpen, Calculator, Eye, Lightbulb, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/i18n/i18n";

/** Cabecera de una pestaña: título grande y la pregunta que responde. */
export function TabHeader({
  title,
  question,
  children,
}: {
  title: string;
  question: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground/80">
            {t("app.analytics.questionAnswered")}{" "}
          </span>
          {question}
        </p>
      </div>
      {children}
    </div>
  );
}

/** Bloque metodológico en tres columnas: cómo se calcula, cómo se lee, qué buscar. */
export function MethodCard({
  compute,
  read,
  lookFor,
}: {
  compute: React.ReactNode;
  read: React.ReactNode;
  lookFor: React.ReactNode;
}) {
  const { t } = useTranslation();
  const cols = [
    {
      icon: Calculator,
      title: t("app.analytics.method.compute"),
      body: compute,
      tone: "text-brand-deep bg-brand/8",
    },
    {
      icon: Eye,
      title: t("app.analytics.method.read"),
      body: read,
      tone: "text-[#1D8FBF] bg-[#1D8FBF]/10",
    },
    {
      icon: Search,
      title: t("app.analytics.method.lookFor"),
      body: lookFor,
      tone: "text-warning bg-warning/12",
    },
  ];
  return (
    <div className="surface grid grid-cols-1 gap-0 overflow-hidden md:grid-cols-3 md:divide-x">
      {cols.map((c) => (
        <div key={c.title} className="p-6">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                c.tone
              )}
            >
              <c.icon className="h-4 w-4" />
            </span>
            <h3 className="text-base font-extrabold">{c.title}</h3>
          </div>
          <div className="mt-3 text-[15px] leading-relaxed text-foreground/80">
            {c.body}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Hallazgos clave numerados, en texto grande. */
export function KeyFindings({ items }: { items: React.ReactNode[] }) {
  const { t } = useTranslation();
  const list = items.filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div className="surface p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/12 text-success">
          <Lightbulb className="h-4 w-4" />
        </span>
        <h3 className="text-base font-extrabold">
          {t("app.analytics.keyFindings")}
        </h3>
      </div>
      <ol className="mt-4 space-y-4">
        {list.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">
              {i + 1}
            </span>
            <p className="pt-1 text-[16px] leading-relaxed text-foreground/85">
              {item}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Tarjeta de gráfico a ancho completo con guía de lectura al lado. */
export function ChartCard({
  title,
  description,
  howToRead,
  children,
  aside,
  height = "h-[26rem]",
}: {
  title: string;
  description?: string;
  howToRead: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
  height?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="surface p-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          <div className={cn("mt-4 w-full", height)}>{children}</div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-muted/50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <BookOpen className="h-4 w-4 text-brand-deep" />{" "}
              {t("app.analytics.howToRead")}
            </div>
            <div className="mt-2 text-[15px] leading-relaxed text-foreground/80">
              {howToRead}
            </div>
          </div>
          {aside}
        </div>
      </div>
    </div>
  );
}

/** Glosario / nota de interpretación compacta. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-4 text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}
