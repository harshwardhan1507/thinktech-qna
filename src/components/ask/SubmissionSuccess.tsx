"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { YellowCircle, BlueCircle } from "@/components/illustrations/ThinkTechIllustrations";

export interface SubmissionSuccessProps {
  onReset: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  onReset,
}) => {
  return (
    <div
      aria-live="polite"
      className="relative space-y-6 text-center py-8 px-6 rounded-xl bg-white border border-[#E5E7EB] animate-fade-in-up shadow-sm overflow-hidden"
    >
      {/* Subtle geometric accents */}
      <div className="absolute -top-4 -right-4 opacity-50">
        <YellowCircle size={40} />
      </div>
      <div className="absolute bottom-10 -left-2 opacity-50">
        <BlueCircle size={16} />
      </div>

      {/* Large green check icon */}
      <div className="h-16 w-16 rounded-full bg-[#22C55E] text-white flex items-center justify-center mx-auto relative z-10">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Copy */}
      <div className="space-y-3 relative z-10">
        <h2 className="text-xl font-bold text-[#111111]">
          Question submitted!
        </h2>
        <p className="text-sm text-[#687280] max-w-xs mx-auto leading-relaxed whitespace-pre-line">
          Thank you! Your question has been sent anonymously.{"\n"}It will appear on stage if selected by the moderator.
        </p>
      </div>

      {/* Reset Action */}
      <div className="pt-2 relative z-10">
        <Button
          onClick={onReset}
          variant="secondary"
          size="md"
          className="w-full sm:w-auto px-6 font-medium"
        >
          Ask another question
        </Button>
      </div>
    </div>
  );
};
