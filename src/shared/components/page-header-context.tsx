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

export function usePageHeaderName(): string | null {
  return usePageHeaderContext().name;
}

export function useSetPageHeaderName(name: string | null | undefined): void {
  const { setName } = usePageHeaderContext();
  useEffect(() => {
    setName(name ?? null);
    return () => setName(null);
  }, [name, setName]);
}
