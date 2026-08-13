"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import type { DisplayedQuestion } from "@/types";
import { getDisplayedQuestion } from "@/lib/display";

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

export default function StageDisplayPage() {
  const [question, setQuestion] = React.useState<DisplayedQuestion | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Normalize askUrl cleanly avoiding double trailing slashes
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const askUrl = `${rawAppUrl.replace(/\/$/, "")}/ask`;

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

  // Perform ONE initial fetch upon page mount. No Realtime, no polling loops.
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

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between p-8 sm:p-16 select-none relative overflow-hidden">
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
          <span className="text-xs font-mono text-[#FAFAFA] border border-[#27272A] bg-[#111113] rounded-full px-3.5 py-1 uppercase tracking-wider">
            LIVE Q&A
          </span>
        </div>
      </header>

      {/* Center Stage Presentation Area */}
      <section className="my-auto py-12 text-center max-w-5xl mx-auto w-full space-y-8 z-10">
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
              Waiting for the next question...
            </h1>
            <p className="text-base text-[#71717A] font-mono">
              Questions submitted anonymously from phones will appear here live.
            </p>
          </div>
        )}
      </section>

      {/* Footer Area: Dynamic QR Code & Stage Branding */}
      <footer className="w-full flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#27272A] z-10">
        {/* Tagline */}
        <div className="text-left space-y-1">
          <p className="text-sm font-mono text-[#A1A1AA] tracking-wider uppercase font-semibold">
            Ask. Explore. Build.
          </p>
          <p className="text-xs text-[#71717A] font-mono">
            ThinkTech Orientation Live Q&A Stage
          </p>
        </div>

        {/* Dynamic QR Code Section */}
        <div className="flex items-center space-x-4 bg-[#111113] border border-[#27272A] p-3 rounded-xl">
          <div className="bg-[#FAFAFA] p-1.5 rounded-lg shrink-0">
            <QRCodeSVG
              value={askUrl}
              size={56}
              bgColor="#FAFAFA"
              fgColor="#09090B"
              level="M"
            />
          </div>
          <div className="text-left space-y-0.5">
            <p className="text-xs font-mono font-bold text-[#FAFAFA] tracking-wide uppercase">
              SCAN TO ASK ANONYMOUSLY
            </p>
            <p className="text-[11px] font-mono text-[#71717A]">
              Point your camera at the QR code
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
