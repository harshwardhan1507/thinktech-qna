"use client";

import * as React from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Question, QuestionStats } from "@/types";
import {
  fetchModeratorQuestions,
  showQuestion,
  dismissQuestion,
  answerQuestion,
  nextQuestion,
  signOutModerator,
  isModeratorSession,
} from "@/lib/moderator";
import { ModeratorLoginForm } from "@/components/moderator/ModeratorLoginForm";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

function deriveQuestionStats(questions: Question[]): QuestionStats {
  return {
    total: questions.length,
    pending: questions.filter((q) => q.status === "pending").length,
    displayed: questions.filter((q) => q.status === "displayed").length,
    answered: questions.filter((q) => q.status === "answered").length,
    dismissed: questions.filter((q) => q.status === "dismissed").length,
  };
}

function formatTimeAgo(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 30) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ModeratorDashboardPage() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionInFlightId, setActionInFlightId] = React.useState<string | null>(null);

  // Check auth session & set up listener
  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setIsAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setIsAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadData = React.useCallback(async () => {
    setIsLoadingQuestions(true);
    setActionError(null);

    const res = await fetchModeratorQuestions();

    if (!res.success) {
      setActionError(res.message);
      setQuestions([]);
    } else {
      setQuestions(res.data || []);
    }

    setIsLoadingQuestions(false);
  }, []);

  // Fetch questions once authenticated
  React.useEffect(() => {
    let active = true;
    if (session && isModeratorSession(session)) {
      fetchModeratorQuestions().then((res) => {
        if (!active) return;
        if (!res.success) {
          setActionError(res.message);
          setQuestions([]);
        } else {
          setQuestions(res.data || []);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [session]);

  const handleSignOut = async () => {
    await signOutModerator();
    setSession(null);
    setQuestions([]);
  };

  const handleShowQuestion = async (id: string) => {
    setActionInFlightId(id);
    setActionError(null);

    const res = await showQuestion(id);
    if (!res.success) {
      setActionError(res.message);
    }

    await loadData();
    setActionInFlightId(null);
  };

  const handleDismissQuestion = async (id: string) => {
    setActionInFlightId(id);
    setActionError(null);

    const res = await dismissQuestion(id);
    if (!res.success) {
      setActionError(res.message);
    }

    await loadData();
    setActionInFlightId(null);
  };

  const handleMarkAnswered = async (id: string) => {
    setActionInFlightId(id);
    setActionError(null);

    const res = await answerQuestion(id);
    if (!res.success) {
      setActionError(res.message);
    }

    await loadData();
    setActionInFlightId(null);
  };

  const handleNextQuestion = async () => {
    setActionInFlightId("next-action");
    setActionError(null);

    const res = await nextQuestion();
    if (!res.success) {
      setActionError(res.message);
    } else if (res.code === "NO_PENDING") {
      setActionError("Current question marked as answered. No pending questions remain in queue.");
    }

    await loadData();
    setActionInFlightId(null);
  };

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-xs font-mono text-[#71717A] uppercase tracking-widest animate-pulse">
          Checking moderator session...
        </div>
      </main>
    );
  }

  // Render Login Form if unauthenticated or unauthorized role
  if (!session || !isModeratorSession(session)) {
    return (
      <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col items-center justify-center p-4 sm:p-6">
        <ModeratorLoginForm onSuccess={loadData} />
      </main>
    );
  }

  const stats = deriveQuestionStats(questions);
  const currentDisplayedQuestion = questions.find((q) => q.status === "displayed");
  const pendingQuestions = questions.filter((q) => q.status === "pending");

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#27272A]">
        <div>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs tracking-widest uppercase text-[#71717A] font-semibold">
              THINKTECH Q&A
            </span>
            <StatusBadge status="live" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAFAFA] mt-1">
            Moderator Control Panel
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
            {session.user.email}
          </span>
          <Link
            href="/display"
            target="_blank"
            className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#111113] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3F3F46] transition-colors"
          >
            Open Stage Display &nearr;
          </Link>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-xs text-[#71717A] hover:text-[#FAFAFA]"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Action / Notification Banner */}
      {actionError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex justify-between items-center">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-400 font-bold ml-4 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Question Statistics */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-2 border-b border-[#27272A]">
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-[#FAFAFA]">{stats.total}</div>
          <div className="text-xs font-mono text-[#71717A] uppercase tracking-wider">Total</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-[#FAFAFA]">{stats.pending}</div>
          <div className="text-xs font-mono text-[#71717A] uppercase tracking-wider">Pending</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-[#FAFAFA]">{stats.displayed}</div>
          <div className="text-xs font-mono text-[#71717A] uppercase tracking-wider">Displayed</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-[#FAFAFA]">{stats.answered}</div>
          <div className="text-xs font-mono text-[#71717A] uppercase tracking-wider">Answered</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-[#FAFAFA]">{stats.dismissed}</div>
          <div className="text-xs font-mono text-[#71717A] uppercase tracking-wider">Dismissed</div>
        </div>
      </section>

      {/* Hero: Currently Displayed Question */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono tracking-widest text-[#71717A] uppercase font-semibold">
          CURRENTLY DISPLAYED ON STAGE
        </h2>

        {currentDisplayedQuestion ? (
          <div className="p-6 rounded-xl bg-[#111113] border border-[#3F3F46] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A1A1AA] tracking-wide uppercase">
                Active Question
              </span>
              <StatusBadge status="displayed" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#FAFAFA] leading-snug">
              &ldquo;{currentDisplayedQuestion.content}&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#27272A]">
              <span className="text-xs font-mono text-[#71717A]">
                Displayed {formatTimeAgo(currentDisplayedQuestion.displayed_at)} &bull; Anonymous Question
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleMarkAnswered(currentDisplayedQuestion.id)}
                  variant="secondary"
                  size="sm"
                  isLoading={actionInFlightId === currentDisplayedQuestion.id}
                  disabled={actionInFlightId !== null}
                >
                  Mark as Answered
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  variant="primary"
                  size="sm"
                  isLoading={actionInFlightId === "next-action"}
                  disabled={actionInFlightId !== null}
                >
                  Next &rarr;
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-[#111113] border border-dashed border-[#27272A]">
            <p className="text-[#A1A1AA] text-sm">No question is currently displayed on stage.</p>
            <p className="text-xs text-[#71717A] mt-1 font-mono">
              Click &ldquo;SHOW&rdquo; on any pending question below to push it live.
            </p>
          </div>
        )}
      </section>

      {/* Pending Questions Queue */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono tracking-widest text-[#71717A] uppercase font-semibold">
            PENDING QUESTIONS ({pendingQuestions.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadData}
              variant="secondary"
              size="sm"
              isLoading={isLoadingQuestions}
              disabled={isLoadingQuestions || actionInFlightId !== null}
              className="text-xs font-mono"
            >
              Refresh ↻
            </Button>
            {pendingQuestions.length > 0 && (
              <Button
                onClick={handleNextQuestion}
                variant="ghost"
                size="sm"
                isLoading={actionInFlightId === "next-action"}
                disabled={actionInFlightId !== null}
                className="text-xs font-mono text-[#A1A1AA]"
              >
                Show Next &rarr;
              </Button>
            )}
          </div>
        </div>

        {isLoadingQuestions && questions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#111113] border border-[#27272A]">
            <p className="text-[#71717A] text-xs font-mono animate-pulse uppercase tracking-wider">
              Loading questions from database...
            </p>
          </div>
        ) : pendingQuestions.length > 0 ? (
          <div className="divide-y divide-[#27272A] border-t border-b border-[#27272A]">
            {pendingQuestions.map((q) => (
              <div
                key={q.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#111113]/50 transition-colors px-2 rounded-lg"
              >
                <div className="space-y-1 max-w-3xl">
                  <p className="text-base font-medium text-[#FAFAFA] leading-snug">
                    &ldquo;{q.content}&rdquo;
                  </p>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[#71717A]">
                    <span>Anonymous Question</span>
                    <span>&bull;</span>
                    <span>{formatTimeAgo(q.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    onClick={() => handleDismissQuestion(q.id)}
                    variant="ghost"
                    size="sm"
                    isLoading={actionInFlightId === q.id}
                    disabled={actionInFlightId !== null}
                    className="text-xs text-[#71717A] hover:text-rose-400"
                  >
                    DISMISS
                  </Button>
                  <Button
                    onClick={() => handleShowQuestion(q.id)}
                    variant="primary"
                    size="sm"
                    isLoading={actionInFlightId === q.id}
                    disabled={actionInFlightId !== null}
                  >
                    SHOW
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-[#111113] border border-[#27272A]">
            <p className="text-[#A1A1AA] text-sm">No pending questions in queue.</p>
            <p className="text-xs text-[#71717A] font-mono mt-1">
              New submissions from student phones will appear here upon refresh.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
