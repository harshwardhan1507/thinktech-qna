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
      [_ in never]: never;
    };
    Enums: {
      question_status: DatabaseQuestionStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
