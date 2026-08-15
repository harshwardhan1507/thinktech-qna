export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DatabaseQuestionStatus =
  | "pending"
  | "displayed"
  | "answered"
  | "dismissed";

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          content: string;
          status: DatabaseQuestionStatus;
          created_at: string;
          displayed_at: string | null;
          answered_at: string | null;
          dismissed_at: string | null;
        };
        Insert: {
          id?: string;
          content: string;
          status?: DatabaseQuestionStatus;
          created_at?: string;
          displayed_at?: string | null;
          answered_at?: string | null;
          dismissed_at?: string | null;
        };
        Update: {
          id?: string;
          content?: string;
          status?: DatabaseQuestionStatus;
          created_at?: string;
          displayed_at?: string | null;
          answered_at?: string | null;
          dismissed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_displayed_question: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          content: string;
          created_at: string;
          displayed_at: string;
        } | null;
      };
      next_question: {
        Args: Record<string, never>;
        Returns: {
          status: "success" | "no_pending";
          displayed_question_id: string | null;
          answered_question_id: string | null;
        };
      };
      show_question_now: {
        Args: {
          question_id: string;
        };
        Returns: {
          status: "success" | "not_found" | "stale_state";
          displayed_question_id: string | null;
          answered_question_id: string | null;
        };
      };
    };
    Enums: {
      question_status: DatabaseQuestionStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
