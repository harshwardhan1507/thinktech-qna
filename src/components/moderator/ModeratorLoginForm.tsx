"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { signInModerator } from "@/lib/moderator";

export interface ModeratorLoginFormProps {
  onSuccess?: () => void;
}

export const ModeratorLoginForm: React.FC<ModeratorLoginFormProps> = ({
  onSuccess,
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signInModerator(email.trim(), password);
      if (res.error) {
        setError(res.error.message);
      } else if (onSuccess) {
        onSuccess();
      }
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-xl bg-white shadow-sm border border-[#E5E7EB] space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <span className="text-xs tracking-wider text-[#687280] uppercase font-semibold">
          MODERATOR ACCESS
        </span>
        <h2 className="text-xl font-bold tracking-tight text-[#111111]">
          Sign In to Control Panel
        </h2>
        <p className="text-xs text-[#687280]">
          Authorized ThinkTech moderators only.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#EF4444] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="moderator-email"
            className="block text-xs text-[#687280] uppercase tracking-wider font-semibold"
          >
            Email Address
          </label>
          <input
            id="moderator-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="moderator@thinktech.org"
            disabled={isSubmitting}
            required
            className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-[#E5E7EB] text-[#111111] placeholder-[#687280] focus:outline-none focus:border-[#1769D1] focus:ring-1 focus:ring-[#1769D1] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="moderator-password"
            className="block text-xs text-[#687280] uppercase tracking-wider font-semibold"
          >
            Password
          </label>
          <input
            id="moderator-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            disabled={isSubmitting}
            required
            className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-[#E5E7EB] text-[#111111] placeholder-[#687280] focus:outline-none focus:border-[#1769D1] focus:ring-1 focus:ring-[#1769D1] transition-colors"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 font-semibold"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Authenticating..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};
