import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-[#111113] border border-[#27272A] text-[#FAFAFA]",
      elevated: "bg-[#18181B] border border-[#27272A] text-[#FAFAFA]",
      accent:
        "bg-[#18181B] border border-[#3F3F46] text-[#FAFAFA]",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl p-5 transition-all duration-150 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
