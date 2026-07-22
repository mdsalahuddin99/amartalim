import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  completed: number;
  total: number;
  /** Show "X% সম্পন্ন" label above the bar. Default true. */
  showLabel?: boolean;
  /** Show "X / Y পাঠ" below the bar. Default true. */
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

/**
 * Reusable per-course progress bar.
 * Computes percentage from completed/total — no divide-by-zero edge case.
 */
const CourseProgressBar = ({
  completed,
  total,
  showLabel = true,
  showCount = true,
  size = "md",
  className,
}: Props) => {
  const safeTotal = Math.max(total, 0);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  const pct = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);
  const isDone = pct === 100;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-muted-foreground">আপনার অগ্রগতি</span>
          <span className={cn("font-bold", isDone ? "text-primary" : "text-foreground")}>
            {pct}%
          </span>
        </div>
      )}
      <Progress value={pct} className={SIZES[size]} aria-label="course progress" />
      {showCount && safeTotal > 0 && (
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {safeCompleted}টি / {safeTotal}টি পাঠ সম্পন্ন
        </p>
      )}
    </div>
  );
};

export default CourseProgressBar;
