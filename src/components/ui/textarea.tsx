import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={`w-full rounded-lg bg-[#111113] border border-[#27272A] text-[#FAFAFA] p-4 text-base sm:text-sm placeholder:text-[#71717A] focus:outline-none focus:border-[#FAFAFA] focus:ring-1 focus:ring-[#FAFAFA] transition-all duration-150 resize-none min-h-[140px] disabled:opacity-40 disabled:cursor-not-allowed ${
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
