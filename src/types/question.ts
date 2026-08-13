export type QuestionStatus = "pending" | "displayed" | "answered" | "dismissed";

export interface Question {
  id: string;
  content: string;
  status: QuestionStatus;
  created_at: string;
  displayed_at?: string | null;
  answered_at?: string | null;
  dismissed_at?: string | null;
}

export interface QuestionStats {
  total: number;
  pending: number;
  displayed: number;
  answered: number;
  dismissed: number;
}

export interface DisplayedQuestion {
  id: string;
  content: string;
  created_at: string;
  displayed_at: string;
}
