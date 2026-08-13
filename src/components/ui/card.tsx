import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const variants = {
      default:
        "bg-white border border-[#E5E7EB] text-[#111111] shadow-[0_2px_12px_rgba(17,17,17,0.04)]",
      elevated:
        "bg-white border border-[#E5E7EB] text-[#111111] shadow-[0_4px_20px_rgba(17,17,17,0.06)]",
      accent:
        "bg-white border border-[#E5E7EB] border-l-[3px] border-l-[#1769D1] text-[#111111] shadow-[0_2px_12px_rgba(17,17,17,0.04)]",
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
