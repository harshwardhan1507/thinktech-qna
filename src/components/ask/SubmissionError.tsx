"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export interface SubmissionErrorProps {
  onRetry: () => void;
}

export const SubmissionError: React.FC<SubmissionErrorProps> = ({
  onRetry,
}) => {
  return (
    <div
      aria-live="assertive"
      className="space-y-6 text-center py-8 px-6 rounded-xl bg-[#111113] border border-rose-500/30 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Warning Icon */}
      <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
        !
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[#FAFAFA]">Something went wrong</h2>
        <p className="text-sm text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
          We couldn&apos;t submit your question right now. Please try again.
        </p>
      </div>

      {/* Retry Action */}
      <div className="pt-2">
        <Button
          onClick={onRetry}
          variant="secondary"
          size="md"
          className="w-full sm:w-auto px-6 font-medium"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};
