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
      className="space-y-6 text-center py-8 px-6 rounded-xl bg-white border border-[#EF4444]/30 animate-fade-in-up shadow-sm"
    >
      {/* Warning Icon */}
      <div className="h-12 w-12 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-center mx-auto">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[#111111]">Something went wrong</h2>
        <p className="text-sm text-[#687280] max-w-xs mx-auto leading-relaxed">
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
