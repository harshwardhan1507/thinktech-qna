"use client";

import * as React from "react";
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
      <main className="min-h-screen bg-white text-[#111111] flex items-center justify-center p-4">
        <div className="text-xs text-[#687280] uppercase tracking-widest animate-pulse">
          Checking moderator session...
        </div>
      </main>
    );
  }

  // Render Login Form if unauthenticated or unauthorized role
  if (!session || !isModeratorSession(session)) {
    return (
      <main className="min-h-screen bg-[#F5F6F7] text-[#111111] flex flex-col items-center justify-center p-4 sm:p-6">
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
    <main className="min-h-screen bg-[#F5F6F7] text-[#111111]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#1769D1] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <div>
            <div className="font-bold text-[#111111] leading-none mb-1">THINKTECH Q&A</div>
            <div className="text-xs text-[#687280] uppercase tracking-wider leading-none">MODERATOR PANEL</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium bg-[#F5F6F7] px-2 py-1 rounded border border-[#E5E7EB] text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                realtimeStatus === "connected"
                  ? "bg-[#22C55E]"
                  : realtimeStatus === "connecting" || realtimeStatus === "reconnecting"
                  ? "bg-[#FCC400]"
                  : "bg-[#EF4444]"
              }`}
            ></span>
            <span className={`${realtimeStatus === "connected" ? "text-[#22C55E]" : "text-[#687280]"}`}>{getRealtimeStatusBadgeText(realtimeStatus)}</span>
          </span>
          <span className="bg-[#F5F6F7] text-[#687280] text-xs rounded px-2 py-1 border border-[#E5E7EB]">
            {session.user.email}
          </span>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-[#687280] hover:text-[#111111]"
          >
            Sign out &rarr;
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* New Question Toast Banner */}
          {newQuestionToast && (
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] border-l-[3px] border-l-[#1769D1] p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-[#1769D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-[#1769D1] block mb-0.5">NEW QUESTION</span>
                  <span className="text-sm text-[#687280]">{newQuestionToast}</span>
                </div>
              </div>
              <button
                onClick={() => setNewQuestionToast(null)}
                className="text-[#687280] hover:text-[#111111] transition-colors p-1"
                title="Dismiss notification"
              >
                &times;
              </button>
            </div>
          )}

          {/* Action / Notification Banner */}
          {actionError && (
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] border-l-[3px] border-l-[#EF4444] p-4 flex justify-between items-center">
              <span className="text-[#EF4444] text-sm font-medium">{actionError}</span>
              <button
                onClick={() => setActionError(null)}
                className="text-[#EF4444] text-sm font-bold ml-4 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Typography Question Statistics */}
          <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] flex flex-row divide-x divide-[#E5E7EB]">
            <div className="flex-1 p-4 text-center">
              <div className="text-2xl font-bold text-[#111111]">{stats.total}</div>
              <div className="text-xs text-[#687280] uppercase tracking-wider mt-1 font-semibold">TOTAL</div>
            </div>
            <div className="flex-1 p-4 text-center">
              <div className="text-2xl font-bold text-[#111111]">{stats.pending}</div>
              <div className="text-xs text-[#687280] uppercase tracking-wider mt-1 font-semibold">PENDING</div>
            </div>
            <div className="flex-1 p-4 text-center">
              <div className="text-2xl font-bold text-[#111111]">{stats.displayed}</div>
              <div className="text-xs text-[#687280] uppercase tracking-wider mt-1 font-semibold">DISPLAYED</div>
            </div>
            <div className="flex-1 p-4 text-center">
              <div className="text-2xl font-bold text-[#111111]">{stats.answered}</div>
              <div className="text-xs text-[#687280] uppercase tracking-wider mt-1 font-semibold">ANSWERED</div>
            </div>
            <div className="flex-1 p-4 text-center">
              <div className="text-2xl font-bold text-[#111111]">{stats.dismissed}</div>
              <div className="text-xs text-[#687280] uppercase tracking-wider mt-1 font-semibold">DISMISSED</div>
            </div>
          </section>

          {/* Hero: Currently Displayed Question */}
          <section>
            {currentDisplayedQuestion ? (
              <div className="bg-white rounded-lg shadow-md border border-[#E5E7EB] border-l-[4px] border-l-[#1769D1] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1769D1] tracking-wide uppercase">
                    CURRENTLY DISPLAYED
                  </span>
                  <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                    LIVE
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[#111111] leading-tight">
                  &ldquo;{currentDisplayedQuestion.content}&rdquo;
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E5E7EB]">
                  <span className="text-sm text-[#687280]">
                    Anonymous question &bull; Displayed {formatTimeAgo(currentDisplayedQuestion.displayed_at)}
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleMarkAnswered(currentDisplayedQuestion.id)}
                      variant="primary"
                      size="sm"
                      isLoading={actionInFlightId === currentDisplayedQuestion.id}
                      disabled={actionInFlightId !== null}
                    >
                      {actionInFlightId === currentDisplayedQuestion.id ? "Answering..." : "✓ Mark as answered"}
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      variant="secondary"
                      size="sm"
                      isLoading={actionInFlightId === "next-action"}
                      disabled={actionInFlightId !== null}
                    >
                      {actionInFlightId === "next-action" ? "Moving..." : "Next question \u2192"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-dashed border-[#E5E7EB] p-8 text-center space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">NO QUESTION CURRENTLY ON STAGE</h3>
                  <p className="text-sm text-[#687280] mt-1">
                    Click &ldquo;Show&rdquo; on any pending question or push the next question live.
                  </p>
                </div>
                {pendingQuestions.length > 0 && (
                  <Button
                    onClick={handleNextQuestion}
                    variant="primary"
                    size="sm"
                    isLoading={actionInFlightId === "next-action"}
                    disabled={actionInFlightId !== null}
                  >
                    {actionInFlightId === "next-action" ? "Moving..." : "Show next pending"}
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Collapsible Histories */}
          <div className="space-y-4 pt-4">
            {/* Answered History */}
            <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
              <button
                onClick={() => setShowAnsweredHistory((prev) => !prev)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-[#F5F6F7] transition-colors rounded-lg"
              >
                <div className="flex items-center gap-2 text-[#111111] font-bold text-sm">
                  <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  ANSWERED QUESTIONS ({answeredQuestions.length})
                </div>
                <span className="text-[#687280] text-xs font-medium">{showAnsweredHistory ? "▲ HIDE" : "▼ SHOW"}</span>
              </button>

              {showAnsweredHistory && (
                <div className="px-4 pb-4">
                  {answeredQuestions.length > 0 ? (
                    <div className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] pt-2">
                      {answeredQuestions.map((q) => (
                        <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="text-sm text-[#687280] line-through truncate max-w-2xl">{q.content}</p>
                          <span className="text-xs text-[#687280] whitespace-nowrap shrink-0">{formatTimeAgo(q.answered_at)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#687280] py-2">No answered questions yet.</p>
                  )}
                </div>
              )}
            </section>

            {/* Dismissed History */}
            <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
              <button
                onClick={() => setShowDismissedHistory((prev) => !prev)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-[#F5F6F7] transition-colors rounded-lg"
              >
                <div className="flex items-center gap-2 text-[#111111] font-bold text-sm">
                  <svg className="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  DISMISSED QUESTIONS ({dismissedQuestions.length})
                </div>
                <span className="text-[#687280] text-xs font-medium">{showDismissedHistory ? "▲ HIDE" : "▼ SHOW"}</span>
              </button>

              {showDismissedHistory && (
                <div className="px-4 pb-4">
                  {dismissedQuestions.length > 0 ? (
                    <div className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] pt-2">
                      {dismissedQuestions.map((q) => (
                        <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="text-sm text-[#687280] line-through truncate max-w-2xl">{q.content}</p>
                          <span className="text-xs text-[#687280] whitespace-nowrap shrink-0">{formatTimeAgo(q.dismissed_at)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#687280] py-2">No dismissed questions yet.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN (Pending Queue) */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] sticky top-[92px]">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
              PENDING QUESTIONS ({pendingQuestions.length})
            </h2>
            <Button
              onClick={loadData}
              variant="secondary"
              size="sm"
              isLoading={isLoadingQuestions}
              disabled={isLoadingQuestions || actionInFlightId !== null}
              className="text-xs py-1 h-8"
            >
              Refresh ↻
            </Button>
          </div>

          <div className="p-0">
            {isLoadingQuestions && questions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[#687280] animate-pulse">
                  Loading questions...
                </p>
              </div>
            ) : pendingQuestions.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB] max-h-[calc(100vh-200px)] overflow-y-auto">
                {pendingQuestions.map((q, index) => {
                  const queueNumber = String(index + 1).padStart(2, "0");
                  const isConfirmingDismiss = confirmDismissId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="p-4 flex flex-col gap-3 hover:bg-[#F5F6F7] transition-colors"
                    >
                      <div className="flex gap-3">
                        <span className="text-sm font-bold text-[#687280] pt-0.5">
                          {queueNumber}
                        </span>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium text-[#111111] leading-snug break-words">
                            {q.content}
                          </p>
                          <div className="text-xs text-[#687280]">
                            {formatExactTime(q.created_at)} &bull; {formatTimeAgo(q.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 ml-7">
                        {isConfirmingDismiss ? (
                          <div className="flex items-center gap-2 bg-[#F5F6F7] border border-[#EF4444]/40 p-1.5 rounded-md animate-in fade-in duration-200 w-full sm:w-auto">
                            <span className="text-xs text-[#EF4444] font-bold px-1 whitespace-nowrap">
                              Dismiss?
                            </span>
                            <button
                              onClick={() => setConfirmDismissId(null)}
                              className="px-2 py-1 text-xs rounded text-[#687280] hover:text-[#111111] bg-white border border-[#E5E7EB]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleConfirmDismiss(q.id)}
                              className="px-2 py-1 text-xs rounded text-white bg-[#EF4444] hover:bg-[#DC2626] font-bold"
                            >
                              Confirm
                            </button>
                          </div>
                        ) : (
                          <>
                            <Button
                              onClick={() => setConfirmDismissId(q.id)}
                              variant="danger"
                              size="sm"
                              disabled={actionInFlightId !== null}
                              className="text-xs h-8 px-3"
                            >
                              {actionInFlightId === q.id ? "..." : "Dismiss"}
                            </Button>
                            <Button
                              onClick={() => handleShowQuestion(q.id)}
                              variant="ghost"
                              size="sm"
                              isLoading={actionInFlightId === q.id}
                              disabled={actionInFlightId !== null}
                              className="text-xs h-8 px-3 border border-[#1769D1] text-[#1769D1] hover:bg-[#1769D1]/5"
                            >
                              {actionInFlightId === q.id ? "..." : "Show"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-[#111111]">No pending questions</p>
                <p className="text-sm text-[#687280]">
                  New questions will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
