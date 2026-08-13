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
import {
  subscribeToQnaChannel,
  unsubscribeQnaChannel,
  type RealtimeStatus,
  type QnaRealtimeBroadcastEvent,
} from "@/lib/realtime";
import { ModeratorLoginForm } from "@/components/moderator/ModeratorLoginForm";
import { Button } from "@/components/ui/button";

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

function formatExactTime(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getRealtimeStatusBadgeText(status: RealtimeStatus): string {
  switch (status) {
    case "connected":
      return "LIVE";
    case "connecting":
      return "CONNECTING";
    case "reconnecting":
      return "RECONNECTING";
    case "disconnected":
      return "OFFLINE";
    case "error":
      return "CONNECTION ERROR";
  }
}

export default function ModeratorDashboardPage() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionInFlightId, setActionInFlightId] = React.useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = React.useState<RealtimeStatus>("connecting");

  // UX State: Toast notification for new questions
  const [newQuestionToast, setNewQuestionToast] = React.useState<string | null>(null);
  // UX State: Inline confirmation ID for dismiss action
  const [confirmDismissId, setConfirmDismissId] = React.useState<string | null>(null);
  // UX State: Collapsible history sections
  const [showAnsweredHistory, setShowAnsweredHistory] = React.useState(false);
  const [showDismissedHistory, setShowDismissedHistory] = React.useState(false);

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

  // Auto-dismiss new question toast after 5 seconds
  React.useEffect(() => {
    if (!newQuestionToast) return;
    const timer = setTimeout(() => {
      setNewQuestionToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [newQuestionToast]);

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

  // Subscribe to Realtime Broadcast channel when authenticated
  React.useEffect(() => {
    if (!session || !isModeratorSession(session)) return;

    const handleEvent = (event: QnaRealtimeBroadcastEvent) => {
      loadData();
      // Show toast notification ONLY for new question creation
      if (event.event === "QUESTION_CREATED") {
        setNewQuestionToast("A new anonymous question has arrived.");
      }
    };

    const handleStatusChange = (status: RealtimeStatus) => {
      setRealtimeStatus(status);
      if (status === "connected") {
        // Authoritative refresh on reconnect
        loadData();
      }
    };

    const channel = subscribeToQnaChannel(supabase, handleEvent, handleStatusChange);

    return () => {
      unsubscribeQnaChannel(supabase, channel);
    };
  }, [session, loadData]);

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

  const handleConfirmDismiss = async (id: string) => {
    setConfirmDismissId(null);
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
  const pendingQuestions = questions
    .filter((q) => q.status === "pending")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const answeredQuestions = questions
    .filter((q) => q.status === "answered")
    .sort((a, b) => new Date(b.answered_at || b.created_at).getTime() - new Date(a.answered_at || a.created_at).getTime());
  const dismissedQuestions = questions
    .filter((q) => q.status === "dismissed")
    .sort((a, b) => new Date(b.dismissed_at || b.created_at).getTime() - new Date(a.dismissed_at || a.created_at).getTime());

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs tracking-widest uppercase text-[#71717A] font-semibold">
              THINKTECH Q&A MODERATOR
            </span>
            <span className="text-xs font-mono text-[#FAFAFA] border border-[#27272A] bg-[#111113] rounded-full px-3 py-0.5 uppercase tracking-wider flex items-center space-x-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  realtimeStatus === "connected"
                    ? "bg-emerald-400 animate-pulse"
                    : realtimeStatus === "connecting" || realtimeStatus === "reconnecting"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-400"
                }`}
              ></span>
              <span>{getRealtimeStatusBadgeText(realtimeStatus)}</span>
            </span>
          </div>
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
            SIGN OUT
          </Button>
        </div>
      </header>

      {/* New Question Toast Banner */}
      {newQuestionToast && (
        <div className="p-3.5 rounded-xl bg-[#111113] border border-[#3F3F46] text-[#FAFAFA] text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <span className="font-bold uppercase tracking-wider text-[#FAFAFA] block">NEW QUESTION</span>
              <span className="text-[#A1A1AA]">{newQuestionToast}</span>
            </div>
          </div>
          <button
            onClick={() => setNewQuestionToast(null)}
            className="text-[#71717A] hover:text-[#FAFAFA] font-bold px-2 py-1 text-sm transition-colors"
            title="Dismiss notification"
          >
            &times;
          </button>
        </div>
      )}

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

      {/* Typography Question Statistics */}
      <section className="py-2 border-b border-[#27272A] space-y-2">
        <div className="text-[11px] font-mono tracking-widest text-[#71717A] uppercase font-semibold">
          QUESTION STATISTICS
        </div>
        <div className="grid grid-cols-5 gap-2 text-center sm:text-left">
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA]">{stats.total}</div>
            <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">TOTAL</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA]">{stats.pending}</div>
            <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">PENDING</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA]">{stats.displayed}</div>
            <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">DISPLAYED</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA]">{stats.answered}</div>
            <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">ANSWERED</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA]">{stats.dismissed}</div>
            <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">DISMISSED</div>
          </div>
        </div>
      </section>

      {/* Hero: Currently Displayed Question */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-mono tracking-widest text-[#71717A] uppercase font-semibold">
          CURRENTLY DISPLAYED
        </h2>

        {currentDisplayedQuestion ? (
          <div className="p-5 rounded-xl bg-[#111113] border border-[#3F3F46] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A1A1AA] tracking-wide uppercase font-semibold">
                CURRENT QUESTION
              </span>
              <span className="text-[11px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Displayed Live
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-[#FAFAFA] leading-snug">
              &ldquo;{currentDisplayedQuestion.content}&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#27272A]">
              <span className="text-xs font-mono text-[#71717A]">
                ANONYMOUS QUESTION &bull; Displayed {formatTimeAgo(currentDisplayedQuestion.displayed_at)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleMarkAnswered(currentDisplayedQuestion.id)}
                  variant="secondary"
                  size="sm"
                  isLoading={actionInFlightId === currentDisplayedQuestion.id}
                  disabled={actionInFlightId !== null}
                >
                  {actionInFlightId === currentDisplayedQuestion.id ? "ANSWERING..." : "MARK AS ANSWERED"}
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  variant="primary"
                  size="sm"
                  isLoading={actionInFlightId === "next-action"}
                  disabled={actionInFlightId !== null}
                >
                  {actionInFlightId === "next-action" ? "MOVING..." : "NEXT QUESTION \u2192"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-[#111113] border border-dashed border-[#27272A] space-y-3">
            <div>
              <p className="text-[#A1A1AA] text-sm font-medium">NO QUESTION CURRENTLY ON STAGE</p>
              <p className="text-xs text-[#71717A] mt-0.5 font-mono">
                Click &ldquo;SHOW&rdquo; on any pending question or push the next question live.
              </p>
            </div>
            {pendingQuestions.length > 0 && (
              <Button
                onClick={handleNextQuestion}
                variant="primary"
                size="sm"
                isLoading={actionInFlightId === "next-action"}
                disabled={actionInFlightId !== null}
                className="text-xs font-mono"
              >
                {actionInFlightId === "next-action" ? "MOVING..." : "[ SHOW NEXT PENDING ]"}
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Pending Questions Queue */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-mono tracking-widest text-[#71717A] uppercase font-semibold">
            PENDING QUESTIONS ({pendingQuestions.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadData}
              variant="secondary"
              size="sm"
              isLoading={isLoadingQuestions}
              disabled={isLoadingQuestions || actionInFlightId !== null}
              className="text-xs font-mono py-1 h-7"
            >
              Refresh ↻
            </Button>
          </div>
        </div>

        {isLoadingQuestions && questions.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#111113] border border-[#27272A]">
            <p className="text-[#71717A] text-xs font-mono animate-pulse uppercase tracking-wider">
              LOADING QUESTIONS...
            </p>
          </div>
        ) : pendingQuestions.length > 0 ? (
          <div className="divide-y divide-[#27272A] border-t border-b border-[#27272A]">
            {pendingQuestions.map((q, index) => {
              const queueNumber = String(index + 1).padStart(2, "0");
              const isConfirmingDismiss = confirmDismissId === q.id;

              return (
                <div
                  key={q.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#111113]/50 transition-colors px-2 rounded-lg"
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <span className="font-mono text-xs font-bold text-[#71717A] shrink-0 pt-0.5">
                      {queueNumber}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-[#FAFAFA] leading-snug">
                        &ldquo;{q.content}&rdquo;
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-[#71717A]">
                        <span>{formatExactTime(q.created_at)}</span>
                        <span>&bull;</span>
                        <span>{formatTimeAgo(q.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {isConfirmingDismiss ? (
                      /* Inline Dismiss Confirmation */
                      <div className="flex items-center space-x-1.5 bg-[#18181B] border border-rose-500/40 p-1 rounded-lg animate-in fade-in duration-200">
                        <span className="text-[10px] font-mono text-rose-400 font-bold px-1 uppercase">
                          DISMISS THIS QUESTION?
                        </span>
                        <button
                          onClick={() => setConfirmDismissId(null)}
                          className="px-2 py-0.5 text-[11px] font-mono rounded text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#27272A]"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={() => handleConfirmDismiss(q.id)}
                          className="px-2 py-0.5 text-[11px] font-mono rounded text-white bg-rose-600 hover:bg-rose-500 font-bold"
                        >
                          CONFIRM
                        </button>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => setConfirmDismissId(q.id)}
                          variant="ghost"
                          size="sm"
                          disabled={actionInFlightId !== null}
                          className="text-xs text-[#71717A] hover:text-rose-400 h-7 px-2.5"
                        >
                          {actionInFlightId === q.id ? "DISMISSING..." : "DISMISS"}
                        </Button>
                        <Button
                          onClick={() => handleShowQuestion(q.id)}
                          variant="primary"
                          size="sm"
                          isLoading={actionInFlightId === q.id}
                          disabled={actionInFlightId !== null}
                          className="h-7 px-3 text-xs"
                        >
                          {actionInFlightId === q.id ? "SHOWING..." : "SHOW"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-[#111113] border border-[#27272A]">
            <p className="text-[#A1A1AA] text-sm font-medium">NO PENDING QUESTIONS</p>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">
              New questions will appear here automatically.
            </p>
          </div>
        )}
      </section>

      {/* Collapsible Answered History */}
      <section className="border-t border-[#27272A] pt-3">
        <button
          onClick={() => setShowAnsweredHistory((prev) => !prev)}
          className="flex items-center justify-between w-full text-left py-1 text-[11px] font-mono tracking-widest text-[#71717A] uppercase font-semibold hover:text-[#A1A1AA] transition-colors"
        >
          <span>ANSWERED QUESTIONS ({answeredQuestions.length})</span>
          <span>{showAnsweredHistory ? "▲ HIDE" : "▼ SHOW"}</span>
        </button>

        {showAnsweredHistory && (
          <div className="mt-2 space-y-2">
            {answeredQuestions.length > 0 ? (
              <div className="divide-y divide-[#27272A]/50 border-t border-[#27272A]/50">
                {answeredQuestions.map((q) => (
                  <div key={q.id} className="py-2.5 flex items-center justify-between gap-4 text-xs font-mono">
                    <p className="text-[#A1A1AA] line-through truncate max-w-2xl">&ldquo;{q.content}&rdquo;</p>
                    <span className="text-[#71717A] shrink-0">{formatTimeAgo(q.answered_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#71717A] py-2">NO ANSWERED QUESTIONS</p>
            )}
          </div>
        )}
      </section>

      {/* Collapsible Dismissed History */}
      <section className="border-t border-[#27272A] pt-3 pb-6">
        <button
          onClick={() => setShowDismissedHistory((prev) => !prev)}
          className="flex items-center justify-between w-full text-left py-1 text-[11px] font-mono tracking-widest text-[#71717A] uppercase font-semibold hover:text-[#A1A1AA] transition-colors"
        >
          <span>DISMISSED QUESTIONS ({dismissedQuestions.length})</span>
          <span>{showDismissedHistory ? "▲ HIDE" : "▼ SHOW"}</span>
        </button>

        {showDismissedHistory && (
          <div className="mt-2 space-y-2">
            {dismissedQuestions.length > 0 ? (
              <div className="divide-y divide-[#27272A]/50 border-t border-[#27272A]/50">
                {dismissedQuestions.map((q) => (
                  <div key={q.id} className="py-2.5 flex items-center justify-between gap-4 text-xs font-mono">
                    <p className="text-[#71717A] line-through truncate max-w-2xl">&ldquo;{q.content}&rdquo;</p>
                    <span className="text-[#71717A] shrink-0">{formatTimeAgo(q.dismissed_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#71717A] py-2">NO DISMISSED QUESTIONS</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
