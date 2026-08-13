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
  if (length < 120) {
    return "text-4xl sm:text-6xl md:text-7xl leading-[1.15]";
  }
  if (length < 280) {
    return "text-2xl sm:text-4xl md:text-5xl leading-[1.25]";
  }
  return "text-xl sm:text-2xl md:text-3xl leading-[1.35]";
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

export default function StageDisplayPage() {
  const [question, setQuestion] = React.useState<DisplayedQuestion | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = React.useState<RealtimeStatus>("connecting");

  // Get normalized ask URL safely
  const askUrl = getAskUrl();

  const loadDisplayedQuestion = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const res = await getDisplayedQuestion();

    if (!res.success) {
      setErrorMsg(res.message);
      setQuestion(null);
    } else {
      setQuestion(res.data ?? null);
    }

    setIsLoading(false);
  }, []);

  // Initial load via get_displayed_question() RPC
  React.useEffect(() => {
    let active = true;
    getDisplayedQuestion().then((res) => {
      if (!active) return;
      if (!res.success) {
        setErrorMsg(res.message);
        setQuestion(null);
      } else {
        setQuestion(res.data ?? null);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Subscribe to Realtime Broadcast channel (using public supabaseAnon client)
  React.useEffect(() => {
    const handleEvent = (event: QnaRealtimeBroadcastEvent) => {
      const displayPayload = event.payload.display;
      if (displayPayload && displayPayload.id && displayPayload.content && displayPayload.displayed_at) {
        setQuestion({
          id: displayPayload.id,
          content: displayPayload.content,
          created_at: displayPayload.created_at || new Date().toISOString(),
          displayed_at: displayPayload.displayed_at,
        });
      } else if (displayPayload !== undefined) {
        setQuestion(null);
      }
    };

    const handleStatusChange = (status: RealtimeStatus) => {
      setRealtimeStatus(status);
      if (status === "connected") {
        // Authoritative refresh on reconnect
        loadDisplayedQuestion();
      }
    };

    const channel = subscribeToQnaChannel(supabaseAnon, handleEvent, handleStatusChange);

    return () => {
      unsubscribeQnaChannel(supabaseAnon, channel);
    };
  }, [loadDisplayedQuestion]);

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between p-8 sm:p-14 select-none relative overflow-hidden">
      {/* Stage Header */}
      <header className="w-full flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FAFAFA] animate-pulse"></span>
          <span className="font-mono text-sm tracking-[0.25em] uppercase text-[#71717A] font-semibold">
            THINKTECH
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadDisplayedQuestion}
            disabled={isLoading}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#111113] text-[#71717A] hover:text-[#FAFAFA] hover:border-[#3F3F46] transition-all disabled:opacity-50"
            title="Manual stage refresh"
          >
            {isLoading ? "Loading..." : "Refresh ↻"}
          </button>
          <span className="text-xs font-mono text-[#FAFAFA] border border-[#27272A] bg-[#111113] rounded-full px-3.5 py-1 uppercase tracking-wider flex items-center space-x-2">
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
      </header>

      {/* Center Stage Presentation Area */}
      <section className="my-auto py-8 text-center max-w-5xl mx-auto w-full space-y-8 z-10">
        {isLoading ? (
          /* Loading State */
          <div className="space-y-4 py-8">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#71717A] font-mono animate-pulse uppercase">
              Connecting to Stage Display...
            </h1>
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div className="space-y-4 py-8 max-w-xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-400">
              Unable to load the current question.
            </h1>
            <p className="text-sm text-[#71717A] font-mono">
              Please refresh this display or check your network connection.
            </p>
          </div>
        ) : question ? (
          /* Active Displayed Question State */
          <div className="space-y-6 transition-all duration-500 motion-reduce:transition-none motion-reduce:transform-none">
            <h1
              className={`font-extrabold tracking-tight text-[#FAFAFA] max-w-4xl mx-auto ${getQuestionFontSizeClass(
                question.content.length
              )}`}
            >
              &ldquo;{question.content}&rdquo;
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#27272A] bg-[#111113] text-[#A1A1AA] font-mono text-xs sm:text-sm tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FAFAFA]"></span>
              Anonymous Question &bull; Displayed {formatTimeAgo(question.displayed_at)}
            </div>
          </div>
        ) : (
          /* Empty / Waiting State */
          <div className="space-y-4 py-8 transition-all duration-500 motion-reduce:transition-none">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#A1A1AA] leading-tight">
              WAITING FOR THE NEXT QUESTION
            </h1>
            <p className="text-base text-[#71717A] font-mono">
              Questions submitted anonymously from phones will appear here live.
            </p>
          </div>
        )}
      </section>

      {/* Footer Area: Dynamic QR Code Presentation Card & Stage Tagline */}
      <footer className="w-full flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#27272A] z-10">
        {/* Tagline & Subtitle */}
        <div className="text-left space-y-1">
          <p className="text-sm font-mono text-[#A1A1AA] tracking-wider uppercase font-semibold">
            Ask. Explore. Build.
          </p>
          <p className="text-xs text-[#71717A] font-mono">
            ThinkTech Orientation Live Q&A Stage
          </p>
        </div>

        {/* Audience QR Code Call-to-Action Card (Available in both active & waiting states) */}
        <div className="flex items-center space-x-5 bg-[#111113] border border-[#27272A] p-3.5 rounded-2xl">
          <QrCode
            value={askUrl}
            size={128}
            ariaLabel="QR code to open ThinkTech anonymous Q&A"
          />
          <div className="text-left space-y-1 pr-2">
            <p className="text-xs font-mono font-bold text-[#FAFAFA] tracking-widest uppercase">
              ASK A QUESTION
            </p>
            <p className="text-xs font-mono text-[#A1A1AA]">
              Scan the QR code
            </p>
            <p className="text-[11px] font-mono text-[#71717A]">
              or use the volunteer&apos;s phone
            </p>
            <p className="text-[10px] font-mono text-[#3F3F46] pt-1 select-all">
              /ask
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
