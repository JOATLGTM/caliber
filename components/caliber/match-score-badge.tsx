import { cn } from "@/lib/utils";
import { scoreClass } from "@/lib/mock-data";

type Treatment = "big" | "badge" | "quiet";

interface MatchScoreBadgeProps {
  score: number;
  treatment?: Treatment;
  className?: string;
}

const tone: Record<"high" | "mid" | "low", string> = {
  high: "text-score-high",
  mid: "text-score-mid",
  low: "text-score-low",
};

export function MatchScoreBadge({
  score,
  treatment = "big",
  className,
}: MatchScoreBadgeProps) {
  if (treatment === "quiet") {
    return (
      <span className={cn("font-mono text-xs text-text-muted", className)}>
        {score}% match
      </span>
    );
  }

  if (treatment === "badge") {
    return (
      <span
        className={cn(
          "inline-flex h-[22px] items-center gap-1 rounded-[4px] border px-2 text-[11.5px] font-medium",
          score >= 85
            ? "border-good/35 bg-good/10 text-good"
            : "border-border bg-bg-elev-2 text-text-muted",
          className,
        )}
      >
        {score}% match
      </span>
    );
  }

  const klass = scoreClass(score);
  return (
    <div
      className={cn(
        "flex min-w-[130px] flex-col items-end justify-between text-right",
        className,
      )}
    >
      <div
        className={cn(
          "font-display text-[56px] font-semibold leading-none tracking-[-0.04em] tabular-nums",
          tone[klass],
        )}
      >
        {score}
        <sup className="relative top-[6px] ml-[2px] align-top text-[18px] font-medium tracking-normal text-text-faint">
          %
        </sup>
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.04em] text-text-faint">
        match
      </div>
    </div>
  );
}
