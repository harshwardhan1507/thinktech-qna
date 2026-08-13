"use client";

import * as React from "react";
import { INITIAL_MOCK_QUESTIONS } from "@/lib/mock/questions";

export default function StageDisplayPage() {
  // Phase 1/2 isolated display mock state with a toggle to demonstrate both Active Question and Waiting states
  const [showWaitingState, setShowWaitingState] = React.useState(false);
  const activeQuestion = INITIAL_MOCK_QUESTIONS.find((q) => q.status === "displayed");

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between p-8 sm:p-16 select-none relative overflow-hidden">
      {/* Top Header Branding & State Toggle */}
      <header className="w-full flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FAFAFA]"></span>
          <span className="font-mono text-sm tracking-[0.25em] uppercase text-[#71717A] font-semibold">
            THINKTECH SOCIETY
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowWaitingState((prev) => !prev)}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#111113] text-[#71717A] hover:text-[#FAFAFA] hover:border-[#3F3F46] transition-all opacity-60 hover:opacity-100"
            title="Toggle between Question mode and Waiting mode"
          >
            State: {showWaitingState ? "Waiting Mode" : "Active Question"}
          </button>
          <span className="text-xs font-mono text-[#FAFAFA] border border-[#27272A] bg-[#111113] rounded-full px-3.5 py-1 uppercase tracking-wider">
            LIVE Q&A
          </span>
        </div>
      </header>

      {/* Center Stage Presentation Area */}
      <section className="my-auto py-12 text-center max-w-5xl mx-auto w-full space-y-8 z-10">
        {!showWaitingState && activeQuestion ? (
          /* Active Question State */
          <div className="space-y-6 animate-in fade-in duration-300">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FAFAFA] leading-[1.15]">
              &ldquo;{activeQuestion.content}&rdquo;
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#27272A] bg-[#111113] text-[#A1A1AA] font-mono text-sm tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FAFAFA]"></span>
              Anonymous Question
            </div>
          </div>
        ) : (
          /* Empty / Waiting State */
          <div className="space-y-4 animate-in fade-in duration-300 py-8">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#A1A1AA] leading-tight">
              Waiting for the next question...
            </h1>
            <p className="text-base text-[#71717A] font-mono">
              Scan to ask anonymously
            </p>
          </div>
        )}
      </section>

      {/* Footer Area: Simple QR Placeholder Box & Tagline */}
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

        {/* Visual QR Code Placeholder Block */}
        <div className="flex items-center space-x-4 bg-[#111113] border border-[#27272A] p-3 rounded-xl">
          <div className="h-14 w-14 bg-[#FAFAFA] text-[#09090B] rounded-lg flex items-center justify-center font-mono font-bold text-xs tracking-widest uppercase shadow-sm">
            QR
          </div>
          <div className="text-left space-y-0.5">
            <p className="text-xs font-mono font-bold text-[#FAFAFA] tracking-wide">
              Scan to ask anonymously
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
