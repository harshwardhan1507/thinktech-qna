import type { QuestionStatus } from "@/types";

export type RealtimeStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface SanitizedDisplayPayload {
  id: string | null;
  content: string | null;
  created_at: string | null;
  displayed_at: string | null;
}

export interface BroadcastQnaPayload {
  id: string;
  status: QuestionStatus;
  display: SanitizedDisplayPayload | null;
}

export interface QnaRealtimeBroadcastEvent {
  event: "QUESTION_CREATED" | "QUESTION_STATE_CHANGED";
  payload: BroadcastQnaPayload;
}
