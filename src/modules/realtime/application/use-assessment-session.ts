import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { baseURL } from "@/shared/api/http-client";

interface AssessmentScoreUpdatedPayload {
  evaluationId: string;
  indicatorIds: string[];
  scoredBy: string;
}

// Sesión colaborativa del taller (doc ai-ssd 01 §3, 03 §7 F7a): cuando otro
// facilitador califica un KPI de la misma evaluación, este hook recibe
// score.updated y dispara onScoreUpdated para que el llamador refresque su
// estado local (la app no usa TanStack Query para evaluaciones, así
// que no hay cache que invalidar — el patrón es "avísame y yo recargo").
export function useAssessmentSession(
  org: string | undefined,
  evaluationId: string | undefined,
  token: string | undefined,
  onScoreUpdated: (payload: AssessmentScoreUpdatedPayload) => void
): void {
  const callbackRef = useRef(onScoreUpdated);
  callbackRef.current = onScoreUpdated;

  useEffect(() => {
    if (!org || !evaluationId || !token || !baseURL) return;

    // baseURL puede ser relativo ("/api" con el proxy de Vite) o absoluto. El
    // namespace del gateway es /assessments; el path de Socket.IO va bajo baseURL
    // para que el proxy lo reenvíe al backend.
    const apiUrl = new URL(baseURL, window.location.origin);
    const socket: Socket = io(`${apiUrl.origin}/assessments`, {
      path: `${apiUrl.pathname.replace(/\/$/, "")}/socket.io`,
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join", { org, evaluationId });
    });

    socket.on("score.updated", (payload: AssessmentScoreUpdatedPayload) => {
      if (payload?.evaluationId === evaluationId) {
        callbackRef.current(payload);
      }
    });

    return () => {
      socket.emit("leave", { evaluationId });
      socket.disconnect();
    };
  }, [org, evaluationId, token]);
}
