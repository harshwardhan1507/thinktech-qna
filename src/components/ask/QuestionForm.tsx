"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface QuestionFormProps {
  onSubmit: (questionText: string) => void;
  isSubmitting: boolean;
  autoFocus?: boolean;
  initialValue?: string;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  onSubmit,
  isSubmitting,
  autoFocus = true,
  initialValue = "",
}) => {
  const [question, setQuestion] = React.useState(initialValue);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const MAX_LENGTH = 500;
  const MIN_LENGTH = 3;
  const charCount = question.length;

  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "Please enter a question.";
    }
    if (trimmed.length < MIN_LENGTH) {
      return `Your question must be at least ${MIN_LENGTH} characters.`;
    }
    if (trimmed.length > MAX_LENGTH) {
      return `Your question cannot exceed ${MAX_LENGTH} characters.`;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const validationError = validate(question);
    if (validationError) {
      setError(validationError);
      textareaRef.current?.focus();
      return;
    }

    setError(null);
    onSubmit(question.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuestion(value);

    if (touched) {
      const currentError = validate(value);
      setError(currentError);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Form Field Container */}
      <div className="space-y-2">
        <label
          htmlFor="question-input"
          className="block text-xs font-medium tracking-wide text-[#687280] uppercase"
        >
          Your Anonymous Question
        </label>

        <Textarea
          id="question-input"
          ref={textareaRef}
          value={question}
          onChange={handleChange}
          placeholder="What's on your mind? Ask ThinkTech anything..."
          maxLength={MAX_LENGTH}
          error={error || undefined}
          disabled={isSubmitting}
          aria-describedby={error ? "question-error" : "character-count"}
          aria-invalid={!!error}
          aria-required="true"
        />

        {/* Dynamic Character Counter */}
        <div className="flex justify-between items-center text-xs text-[#687280] px-1">
          <span>Min 3 characters</span>
          <span
            id="character-count"
            className={
              charCount >= MAX_LENGTH
                ? "text-[#EF4444] font-bold"
                : charCount > 450
                ? "text-amber-600 font-semibold"
                : "text-[#687280]"
            }
          >
            {charCount} / {MAX_LENGTH}
          </span>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {error}
      </div>

      {/* Primary Submit Action */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full font-semibold text-base py-3.5"
        isLoading={isSubmitting}
        disabled={isSubmitting || (touched && !!error)}
      >
        {isSubmitting ? "Submitting..." : "Send Question →"}
      </Button>
    </form>
  );
};
