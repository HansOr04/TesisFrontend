import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { baseURL } from "@/shared/api/http-client";

interface AssessmentScoreUpdatedPayload {
  evaluationId: string;
  indicatorIds: string[];
  scoredBy: string;
}

export function useAssessmentSession(
  org: string | undefined,
  evaluationId: string | undefined,
  token: string | undefined,
  onScoreUpdated: (payload: AssessmentScoreUpdatedPayload) => void,
  currentUserId?: string
): void {
  const callbackRef = useRef(onScoreUpdated);
  callbackRef.current = onScoreUpdated;
  const userIdRef = useRef(currentUserId);
  userIdRef.current = currentUserId;

  useEffect(() => {
    if (!org || !evaluationId || !token || !baseURL) return;

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
      if (payload?.scoredBy && payload.scoredBy === userIdRef.current) return;
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
