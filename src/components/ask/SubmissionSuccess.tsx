"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export interface SubmissionSuccessProps {
  onReset: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  onReset,
}) => {
  return (
    <div
      aria-live="polite"
      className="space-y-6 text-center py-8 px-6 rounded-xl bg-[#111113] border border-[#27272A] animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Icon */}
      <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 text-[#FAFAFA] flex items-center justify-center mx-auto text-xl font-bold">
        ✓
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[#FAFAFA]">
          Question Submitted
        </h2>
        <p className="text-sm text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
          Your question has been received and will be reviewed by ThinkTech.
        </p>
        <p className="text-xs font-mono text-[#71717A] pt-1">
          Your question remains anonymous.
        </p>
      </div>

      {/* Reset Action */}
      <div className="pt-2">
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
