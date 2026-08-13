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
    neutral: "bg-[#18181B] text-[#A1A1AA] border-[#27272A]",
    active: "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    danger: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}
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
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 mr-1.5"></span>
          Pending
        </Badge>
      );
    case "displayed":
      return (
        <Badge variant="active" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#09090B] mr-1.5"></span>
          Displayed
        </Badge>
      );
    case "answered":
      return (
        <Badge variant="success" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
          Answered
        </Badge>
      );
    case "dismissed":
      return (
        <Badge variant="danger" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5"></span>
          Dismissed
        </Badge>
      );
    case "live":
      return (
        <Badge variant="success" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
          Live
        </Badge>
      );
    case "reconnecting":
      return (
        <Badge variant="warning" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping mr-1.5"></span>
          Reconnecting
        </Badge>
      );
    case "offline":
      return (
        <Badge variant="neutral" className={className}>
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 mr-1.5"></span>
          Offline
        </Badge>
      );
    default:
      return null;
  }
};
