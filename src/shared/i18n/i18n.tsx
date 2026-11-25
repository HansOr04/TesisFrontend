import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en from "./en.json";
import es from "./es.json";

export type Locale = "es" | "en";
const DICTS: Record<Locale, Record<string, string>> = { es, en };
const STORAGE_KEY = "assessment.locale";

export type TranslateParams = Record<string, string | number>;
export type Translate = (key: string, params?: TranslateParams) => string;
export type TranslateRich = (
  key: string,
  params?: TranslateParams
) => ReactNode;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
  tr: TranslateRich;
}

function interpolate(text: string, params?: TranslateParams): string {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    params[name] === undefined ? `{{${name}}}` : String(params[name])
  );
}

export function richText(text: string): ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>
  );
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {}
  return "es";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);
  const t = useCallback<Translate>(
    (key, params) =>
      interpolate(
        DICTS[locale][key] ?? DICTS.es[key] ?? key.split(".").pop() ?? key,
        params
      ),
    [locale]
  );
  const tr = useCallback<TranslateRich>(
    (key, params) => richText(t(key, params)),
    [t]
  );
  const value = useMemo(
    () => ({ locale, setLocale, t, tr }),
    [locale, setLocale, t, tr]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx)
    throw new Error("useTranslation must be used inside <I18nProvider>");
  return ctx;
}
