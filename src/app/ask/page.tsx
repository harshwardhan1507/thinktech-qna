"use client";

import * as React from "react";
import Link from "next/link";
import { QuestionForm } from "@/components/ask/QuestionForm";
import { SubmissionSuccess } from "@/components/ask/SubmissionSuccess";
import { SubmissionError } from "@/components/ask/SubmissionError";
import { createQuestion } from "@/lib/questions";

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
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full">
      {/* Top Navigation */}
      <header className="w-full flex justify-between items-center py-3 border-b border-[#27272A]">
        <Link
          href="/"
          className="text-xs font-mono tracking-widest text-[#71717A] hover:text-[#FAFAFA] uppercase transition-colors"
        >
          &larr; THINKTECH
        </Link>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181B] text-[#A1A1AA] border border-[#27272A] uppercase tracking-wider">
          Anonymous Q&A
        </span>
      </header>

      {/* Main Content Area */}
      <div className="my-auto py-6">
        {formState === "idle" || formState === "submitting" ? (
          <div className="space-y-6">
            {/* Header Titles */}
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-mono tracking-widest text-[#71717A] uppercase font-semibold">
                THINKTECH SOCIETY
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA] uppercase">
                Ask ThinkTech Anything
              </h1>
              <p className="text-sm text-[#A1A1AA] pt-0.5">
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

      {/* Footer Privacy Messaging */}
      <footer className="w-full text-center py-4 text-xs text-[#71717A] font-mono space-y-1 border-t border-[#27272A]">
        <p className="font-medium text-[#A1A1AA]">No name. No login. Just your question.</p>
        <p className="text-[10px] text-[#71717A]">
          ThinkTech Orientation &bull; Student Interface
        </p>
      </footer>
    </main>
  );
}
