import type { QuestionStatus } from "@/types";

/**
 * Valid question status transitions enforced across the application and PostgreSQL trigger:
 * - pending -> displayed
 * - pending -> dismissed
 * - displayed -> answered
 */
export const VALID_TRANSITIONS: Record<QuestionStatus, QuestionStatus[]> = {
  pending: ["displayed", "dismissed"],
  displayed: ["answered"],
  answered: [],
  dismissed: [],
};

/**
 * Checks whether a question status transition is valid according to state machine rules.
 */
export function isValidTransition(from: QuestionStatus, to: QuestionStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Standardized application action codes.
 */
export type ActionCode =
  | "SUCCESS"
  | "NOT_FOUND"
  | "STALE_STATE"
  | "CONFLICT"
  | "NO_PENDING"
  | "NO_DISPLAYED"
  | "UNAUTHORIZED"
  | "DATABASE_ERROR";

/**
 * Standardized structured result shape for question lifecycle operations.
 */
export interface ActionResult<T = void> {
  success: boolean;
  code: ActionCode;
  message: string;
  data?: T;
}
