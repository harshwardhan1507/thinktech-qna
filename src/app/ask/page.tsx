"use client";

import * as React from "react";
import Link from "next/link";
import { QuestionForm } from "@/components/ask/QuestionForm";
import { SubmissionSuccess } from "@/components/ask/SubmissionSuccess";
import { SubmissionError } from "@/components/ask/SubmissionError";
import { createQuestion } from "@/lib/questions";
import { AskPageDecoration } from "@/components/illustrations/ThinkTechIllustrations";

type FormState = "idle" | "submitting" | "success" | "error";

export default function StudentAskPage() {
  const [formState, setFormState] = React.useState<FormState>("idle");
  const [lastSubmittedText, setLastSubmittedText] = React.useState("");

  const handleSubmitQuestion = async (questionText: string) => {
    setFormState("submitting");
    setLastSubmittedText(questionText);

    const { error } = await createQuestion(questionText);

    if (error) {
      setFormState("error");
    } else {
      setFormState("success");
    }
  };

  const handleReset = () => {
    setLastSubmittedText("");
    setFormState("idle");
  };

  const handleRetry = () => {
    setFormState("idle");
  };

  return (
    <main className="min-h-screen bg-white text-[#111111] flex flex-col p-4 sm:p-6 max-w-md mx-auto w-full relative overflow-hidden">
      {/* Top Navigation */}
      <header className="w-full flex justify-between items-center py-4 z-10 relative">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-[#111111]"
        >
          THINKTECH Q&A
        </Link>
        <span className="text-xl text-[#111111] font-bold cursor-default select-none">
          &#8801;
        </span>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center py-8 z-10 relative">
        {formState === "idle" || formState === "submitting" ? (
          <div className="space-y-8">
            {/* Header Titles */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ask ThinkTech <span className="text-[#1769D1]">anything.</span>
              </h1>
              <p className="text-sm text-[#687280]">
                Your question is anonymous.
              </p>
            </div>

            {/* Question Form */}
            <QuestionForm
              onSubmit={handleSubmitQuestion}
              isSubmitting={formState === "submitting"}
              initialValue={lastSubmittedText}
            />
          </div>
        ) : formState === "success" ? (
          <SubmissionSuccess onReset={handleReset} />
        ) : (
          <SubmissionError onRetry={handleRetry} />
        )}
      </div>

      {/* Bottom privacy strip */}
      <footer className="w-full py-6 flex justify-between items-center border-t border-[#E5E7EB] z-10 relative">
        <div className="flex items-center gap-1.5 text-xs text-[#687280] uppercase tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span>ANONYMOUS</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#687280] uppercase tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span>NO LOGIN</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#687280] uppercase tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <span>NO JUDGEMENT</span>
        </div>
      </footer>

      {/* Bottom-right decoration */}
      <div className="absolute bottom-0 right-0 opacity-60 pointer-events-none">
        <AskPageDecoration />
      </div>
    </main>
  );
}
