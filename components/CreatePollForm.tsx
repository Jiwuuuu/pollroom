"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MIN_OPTIONS, MAX_OPTIONS } from "@/lib/constants";
import type { CreatePollResponse, ApiError } from "@/lib/types";

export function CreatePollForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAddOption = options.length < MAX_OPTIONS;
  const canRemoveOption = options.length > MIN_OPTIONS;

  const addOption = () => {
    if (canAddOption) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (canRemoveOption) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);

    // Client-side validation
    if (!trimmedQuestion) {
      toast.error("Please enter a question.");
      return;
    }

    if (trimmedOptions.length < MIN_OPTIONS) {
      toast.error(`At least ${MIN_OPTIONS} options are required.`);
      return;
    }

    const uniqueOptions = new Set(
      trimmedOptions.map((o) => o.toLowerCase())
    );
    if (uniqueOptions.size !== trimmedOptions.length) {
      toast.error("Duplicate options are not allowed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          options: trimmedOptions,
        }),
      });

      if (!res.ok) {
        const err: ApiError = await res.json();
        toast.error(err.error || "Failed to create poll.");
        return;
      }

      const data: CreatePollResponse = await res.json();
      toast.success("Poll created!");
      router.push(`/poll/${data.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-[clamp(1.5rem,3vw,2rem)]">
        {/* Question */}
        <div className="space-y-2">
          <Label
            htmlFor="question"
            className="text-muted-foreground font-light text-xs tracking-[0.2em] uppercase"
          >
            Your Question
          </Label>
          <Input
            id="question"
            placeholder="What do you want to ask?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground/50 font-light"
            style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground font-light text-xs tracking-[0.2em] uppercase">
              Options
            </Label>
            <span className="text-muted-foreground/50 font-light text-xs">
              {options.length}/{MAX_OPTIONS}
            </span>
          </div>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-muted-foreground/40 font-light text-xs w-4 text-right shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  disabled={isSubmitting}
                  maxLength={200}
                  className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground/50 font-light"
                  style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                />
              </div>
              {canRemoveOption && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  disabled={isSubmitting}
                  aria-label={`Remove option ${index + 1}`}
                  className="text-muted-foreground/50 hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {canAddOption && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={isSubmitting}
              className="w-full border-dashed border-border text-muted-foreground font-light hover:border-primary/50 hover:text-accent-foreground transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          )}
        </div>

        {/* Decorative line */}
        <div className="h-px w-full bg-border" />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 font-extrabold tracking-wide uppercase text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Poll"
          )}
        </Button>
      </form>
    </div>
  );
}
