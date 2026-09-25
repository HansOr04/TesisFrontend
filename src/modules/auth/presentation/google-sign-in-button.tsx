import { useEffect, useRef } from "react";
import { useAuth } from "../application/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

// Botón "Iniciar sesión con Google" (Google Identity Services). Carga el
// script bajo demanda y entrega el id_token al backend (POST /auth/google).
export function GoogleSignInButton({
  onError,
}: {
  onError: (msg: string) => void;
}) {
  const auth = useAuth();
  const container = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as
    string | undefined;

  useEffect(() => {
    if (!clientId || !container.current) return;
    const render = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) =>
          auth
            .loginGoogle(credential)
            .catch((err: Error) => onError(err.message)),
      });
      if (container.current) {
        window.google?.accounts.id.renderButton(container.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signin_with",
        });
      }
    };
    if (window.google) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [auth, clientId, onError]);

  if (!clientId) return null;
  return <div ref={container} className="flex justify-center" />;
}
