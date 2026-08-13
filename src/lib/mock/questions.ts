import type { Question, QuestionStats } from "@/types";

export const INITIAL_MOCK_QUESTIONS: Question[] = [
  {
    id: "q-1",
    content: "What exactly does ThinkTech do?",
    status: "displayed",
    created_at: "10 mins ago",
    displayed_at: "2 mins ago",
  },
  {
    id: "q-2",
    content: "Can first-year students join the society?",
    status: "pending",
    created_at: "Just now",
  },
  {
    id: "q-3",
    content: "What kind of projects does ThinkTech work on?",
    status: "pending",
    created_at: "3 mins ago",
  },
  {
    id: "q-4",
    content: "How can I become a core member?",
    status: "pending",
    created_at: "5 mins ago",
  },
  {
    id: "q-5",
    content: "Do I need prior coding experience?",
    status: "pending",
    created_at: "7 mins ago",
  },
  {
    id: "q-6",
    content: "What events does ThinkTech organize?",
    status: "pending",
    created_at: "8 mins ago",
  },
  {
    id: "q-7",
    content: "Is there a selection process or interview for joining?",
    status: "pending",
    created_at: "12 mins ago",
  },
  {
    id: "q-8",
    content: "Can non-CS students join ThinkTech?",
    status: "answered",
    created_at: "15 mins ago",
    answered_at: "5 mins ago",
  },
  {
    id: "q-9",
    content: "When are the regular meeting times?",
    status: "answered",
    created_at: "18 mins ago",
    answered_at: "10 mins ago",
  },
];

export function deriveStats(questions: Question[]): QuestionStats {
  return {
    total: questions.length,
    pending: questions.filter((q) => q.status === "pending").length,
    displayed: questions.filter((q) => q.status === "displayed").length,
    answered: questions.filter((q) => q.status === "answered").length,
    dismissed: questions.filter((q) => q.status === "dismissed").length,
  };
}
