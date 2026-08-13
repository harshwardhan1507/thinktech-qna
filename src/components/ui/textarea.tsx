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
          className={`w-full rounded-xl bg-white border border-[#E5E7EB] text-[#111111] p-4 text-base sm:text-sm placeholder:text-[#687280] focus:outline-none focus:border-[#1769D1] focus:ring-2 focus:ring-[#1769D1]/20 transition-all duration-150 resize-none min-h-[140px] disabled:opacity-40 disabled:cursor-not-allowed ${
            error ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
