"use client";

import * as React from "react";
import { getAskUrl } from "@/lib/app-url";
import { QrCode } from "@/components/qr/QrCode";
import { supabaseAnon } from "@/lib/supabase";
import type { DisplayedQuestion } from "@/types";
import { getDisplayedQuestion } from "@/lib/display";
import {
  subscribeToQnaChannel,
  unsubscribeQnaChannel,
  type RealtimeStatus,
  type QnaRealtimeBroadcastEvent,
} from "@/lib/realtime";
import {
  DisplayIllustration,
  BlueCircle,
} from "@/components/illustrations/ThinkTechIllustrations";

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

function getQuestionFontSizeClass(length: number): string {
  if (length < 80) {
    return "text-4xl md:text-5xl lg:text-6xl leading-[1.12]";
  }
  if (length < 180) {
    return "text-3xl md:text-4xl lg:text-5xl leading-[1.15]";
  }
  if (length < 320) {
    return "text-2xl md:text-3xl lg:text-4xl leading-[1.2]";
  }
  return "text-xl md:text-2xl lg:text-3xl leading-[1.25]";
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
      return "ERROR";
  }
}

export default function StageDisplayPage() {
  const [question, setQuestion] = React.useState<DisplayedQuestion | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = React.useState<RealtimeStatus>("connecting");

  // Presentation session question counter & last seen ID tracking
  const [questionCounter, setQuestionCounter] = React.useState(0);
  const lastSeenQuestionIdRef = React.useRef<string | null>(null);

  // Ref to track current question without creating callback dependencies
  const questionRef = React.useRef<DisplayedQuestion | null>(null);

  // Ref to track whether channel was genuinely disconnected before triggering reconnect RPC
  const wasDisconnectedRef = React.useRef(false);

  // Guard flag to ensure initial load RPC happens exactly ONCE per mount
  const hasInitialLoadedRef = React.useRef(false);

  // In-flight guard to prevent duplicate RPC calls
  const refreshInFlightRef = React.useRef(false);

  // Normalize askUrl safely
  const askUrl = getAskUrl();

  const updateQuestionState = React.useCallback((nextQuestion: DisplayedQuestion | null) => {
    if (nextQuestion && nextQuestion.id) {
      if (lastSeenQuestionIdRef.current !== nextQuestion.id) {
        lastSeenQuestionIdRef.current = nextQuestion.id;
        setQuestionCounter((prev) => prev + 1);
      }
      questionRef.current = nextQuestion;
      setQuestion(nextQuestion);
    } else {
      questionRef.current = null;
      setQuestion(null);
    }
  }, []);

  // Stable RPC loader — uses questionRef instead of question state, so identity never changes
  const loadDisplayedQuestion = React.useCallback(
    async (reason: "reconnect" | "initial-load" | "manual" = "reconnect") => {
      if (refreshInFlightRef.current) return;
      refreshInFlightRef.current = true;

      if (process.env.NODE_ENV === "development") {
        console.debug("[DISPLAY] getDisplayedQuestion() called", {
          reason,
          timestamp: Date.now(),
        });
      }

      setIsLoading(true);
      setErrorMsg(null);

      try {
        const res = await getDisplayedQuestion();

        if (!res.success) {
          setErrorMsg(questionRef.current ? null : res.message);
        } else {
          updateQuestionState(res.data ?? null);
        }
      } finally {
        setIsLoading(false);
        refreshInFlightRef.current = false;
      }
    },
    [updateQuestionState]
  );

  // Single mount-only effect: initial load + realtime subscription
  React.useEffect(() => {
    if (!hasInitialLoadedRef.current) {
      hasInitialLoadedRef.current = true;
      loadDisplayedQuestion("initial-load");
    }

    const handleEvent = (event: QnaRealtimeBroadcastEvent) => {
      const displayPayload = event.payload.display;
      if (
        displayPayload &&
        displayPayload.id &&
        displayPayload.content &&
        displayPayload.displayed_at
      ) {
        updateQuestionState({
          id: displayPayload.id,
          content: displayPayload.content,
          created_at: displayPayload.created_at || new Date().toISOString(),
          displayed_at: displayPayload.displayed_at,
        });
      } else if (displayPayload !== undefined) {
        updateQuestionState(null);
      }
    };

    const handleStatusChange = (status: RealtimeStatus) => {
      setRealtimeStatus(status);

      if (
        status === "disconnected" ||
        status === "error" ||
        status === "reconnecting"
      ) {
        wasDisconnectedRef.current = true;
      } else if (status === "connected") {
        if (wasDisconnectedRef.current) {
          wasDisconnectedRef.current = false;
          loadDisplayedQuestion("reconnect");
        }
      }
    };

    const channel = subscribeToQnaChannel(supabaseAnon, handleEvent, handleStatusChange);

    return () => {
      unsubscribeQnaChannel(supabaseAnon, channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedCounter = String(questionCounter).padStart(2, "0");

  return (
    <main className="h-screen w-screen overflow-hidden bg-white text-[#111111] px-8 py-6 lg:px-12 lg:py-8 relative flex flex-col justify-between font-sans select-none box-border">
      {/* Subtle Background Accent */}
      <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none opacity-30">
        <BlueCircle variant="quarter" />
      </div>

      {/* TOP HEADER (~12% height) */}
      <header className="h-[12%] shrink-0 flex items-center justify-between z-10 w-full">
        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight text-[#111111]">
            THINKTECH
          </span>
          <span className="text-[#1769D1] text-xs font-bold tracking-wider uppercase mt-0.5">
            LIVE Q&amp;A
          </span>
          <div className="w-8 h-0.5 bg-[#1769D1] mt-1 rounded-full" />
        </div>

        <div className="flex items-center gap-2 bg-[#F5F6F7] border border-[#E5E7EB] rounded-full px-3.5 py-1">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              realtimeStatus === "connected"
                ? "bg-[#22C55E]"
                : realtimeStatus === "connecting" || realtimeStatus === "reconnecting"
                ? "bg-[#FCC400] animate-pulse"
                : "bg-[#EF4444]"
            }`}
          />
          <span className="text-xs font-bold tracking-wider uppercase">
            {getRealtimeStatusBadgeText(realtimeStatus)}
          </span>
        </div>
      </header>

      {/* HERO QUESTION AREA (~52% height) */}
      <section className="h-[52%] shrink-0 flex flex-row items-center w-full z-10 my-auto">
        {/* Left Column - Question */}
        <div className="w-[70%] lg:w-[73%] pr-8 flex flex-col justify-center max-w-[1100px]">
          {isLoading && !question ? (
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-[#1769D1] uppercase">
                LOADING STREAM
              </span>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#687280] animate-pulse">
                Connecting to stage presentation...
              </h1>
            </div>
          ) : errorMsg && !question ? (
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-[#EF4444] uppercase">
                SYSTEM OFFLINE
              </span>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#EF4444]">
                Connection Error
              </h1>
              <p className="text-sm text-[#687280]">
                Please verify network connectivity.
              </p>
            </div>
          ) : question ? (
            <div
              key={question.id}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
            >
              {/* Editorial Header */}
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#1769D1] uppercase">
                <span>{formattedCounter}</span>
                <span>/</span>
                <span>CURRENT QUESTION</span>
              </div>

              {/* Main Question Text */}
              <h1
                className={`font-extrabold tracking-tight text-[#111111] ${getQuestionFontSizeClass(
                  question.content.length
                )}`}
              >
                &ldquo;{question.content}&rdquo;
              </h1>

              {/* Simple Presentation Subtitle */}
              <p className="text-[#687280] text-xs font-medium tracking-wide">
                Anonymous question &middot; {formatTimeAgo(question.displayed_at)}
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="text-xs font-bold tracking-widest text-[#1769D1] uppercase">
                STAGE READY
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#687280]">
                WAITING FOR THE NEXT QUESTION
              </h1>
              <p className="text-sm text-[#687280]">
                Anonymous questions will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Illustration Anchor */}
        <div className="w-[30%] lg:w-[27%] flex justify-end items-center pointer-events-none shrink-0">
          <div className="w-full max-w-[340px] max-h-[280px]">
            <DisplayIllustration />
          </div>
        </div>
      </section>

      {/* BOTTOM PARTICIPATION AREA (~36% height) - Clean whitespace separation without border line */}
      <footer className="h-[36%] shrink-0 flex items-center justify-between z-10">
        {/* Left Side: Clean CTA */}
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#111111]">
            YOUR TURN.
          </h2>
          <p className="text-[#1769D1] font-semibold text-base lg:text-lg mt-0.5">
            Ask us anything.
          </p>
        </div>

        {/* Right Side: Clean QR Block */}
        <div className="flex items-center gap-4">
          <p className="text-[#111111] text-sm font-bold whitespace-nowrap">
            Scan to ask!
          </p>

          <div className="bg-white p-2 rounded-xl shadow-sm border border-[#E5E7EB] shrink-0">
            <QrCode
              value={askUrl}
              size={150}
              ariaLabel="QR code to open ThinkTech anonymous Q&A"
            />
          </div>
        </div>
      </footer>
    </main>
  );
}
