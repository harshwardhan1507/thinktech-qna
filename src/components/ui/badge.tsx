import * as React from "react";
import type { QuestionStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "active" | "success" | "danger" | "warning";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variants = {
    neutral: "bg-[#F5F6F7] text-[#687280] border-[#E5E7EB]",
    active: "bg-[#EBF2FC] text-[#1769D1] border-[#B8D4F0]",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-[#EF4444] border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: QuestionStatus | "live" | "offline" | "reconnecting";
  className?: string;
}> = ({ status, className = "" }) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="neutral" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#687280] mr-1.5"></span>
          Pending
        </Badge>
      );
    case "displayed":
      return (
        <Badge variant="active" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#1769D1] mr-1.5"></span>
          Displayed
        </Badge>
      );
    case "answered":
      return (
        <Badge variant="success" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Answered
        </Badge>
      );
    case "dismissed":
      return (
        <Badge variant="danger" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] mr-1.5"></span>
          Dismissed
        </Badge>
      );
    case "live":
      return (
        <Badge variant="success" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse mr-1.5"></span>
          Live
        </Badge>
      );
    case "reconnecting":
      return (
        <Badge variant="warning" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping mr-1.5"></span>
          Reconnecting
        </Badge>
      );
    case "offline":
      return (
        <Badge variant="neutral" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#687280] mr-1.5"></span>
          Offline
        </Badge>
      );
    default:
      return null;
  }
};
