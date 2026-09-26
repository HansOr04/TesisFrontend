import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface PageHeaderContextValue {
  name: string | null;
  setName: (name: string | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<string | null>(null);
  return (
    <PageHeaderContext.Provider value={{ name, setName }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

function usePageHeaderContext(): PageHeaderContextValue {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) {
    throw new Error(
      "usePageHeaderContext debe usarse dentro de <PageHeaderProvider>"
    );
  }
  return ctx;
}

/** Lee el nombre destacado actual (lo usa el AppShell para mostrarlo en el navbar). */
export function usePageHeaderName(): string | null {
  return usePageHeaderContext().name;
}

/**
 * Las páginas de una organización/evaluación puntual llaman esto para
 * destacar su nombre en el navbar mientras están montadas.
 */
export function useSetPageHeaderName(name: string | null | undefined): void {
  const { setName } = usePageHeaderContext();
  useEffect(() => {
    setName(name ?? null);
    return () => setName(null);
  }, [name, setName]);
}
