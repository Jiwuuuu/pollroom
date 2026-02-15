import { cn } from "@/lib/utils";

interface PollOptionProps {
  text: string;
  votes?: number;
  percentage?: number;
  isSelected?: boolean;
  showResults?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function PollOption({
  text,
  votes,
  percentage = 0,
  isSelected = false,
  showResults = false,
  onClick,
  disabled = false,
}: PollOptionProps) {
  if (showResults) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-[clamp(0.75rem,2vw,1rem)] transition-all duration-300">
        {/* Progress bar fill */}
        <div
          className="absolute inset-y-0 left-0 bg-primary/8 progress-fill"
          style={{ width: `${percentage}%` }}
        />
        {/* Content */}
        <div className="relative flex items-center justify-between gap-3">
          <span
            className="font-light text-foreground"
            style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
          >
            {text}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="font-extrabold text-foreground tabular-nums"
              style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
            >
              {percentage.toFixed(0)}%
            </span>
            <span className="text-muted-foreground font-light text-xs">
              ({votes} {votes === 1 ? "vote" : "votes"})
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-lg border border-border bg-card p-[clamp(0.75rem,2vw,1rem)] text-left transition-all duration-200",
        "hover:border-primary/40 hover:bg-primary/3",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 shrink-0 transition-all duration-200",
            isSelected
              ? "border-primary bg-primary scale-110"
              : "border-muted-foreground/40"
          )}
        >
          {isSelected && (
            <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
          )}
        </div>
        <span
          className={cn(
            "transition-colors",
            isSelected ? "font-extrabold text-foreground" : "font-light text-foreground/80"
          )}
          style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
        >
          {text}
        </span>
      </div>
    </button>
  );
}
