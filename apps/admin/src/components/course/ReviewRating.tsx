import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Current rating value (0-5, supports decimals for read-only display). */
  value: number;
  /** Called with new value when user clicks a star. Omit for read-only. */
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  /** Show numeric "(4.7)" beside stars. Default true when readOnly. */
  showValue?: boolean;
  /** Optional review count, shown as "(123 রিভিউ)" */
  count?: number;
  className?: string;
}

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * Star rating — readonly when no `onChange`, interactive otherwise.
 * Supports half-star display for readonly (rounded to nearest 0.5).
 */
const ReviewRating = ({
  value,
  onChange,
  size = "md",
  showValue,
  count,
  className,
}: Props) => {
  const readonly = !onChange;
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const sizeClass = SIZES[size];

  const stars = [1, 2, 3, 4, 5].map((i) => {
    const filled = display >= i;
    const half = !filled && display >= i - 0.5;
    const Icon = (
      <span className="relative inline-block">
        <Star className={cn(sizeClass, "text-muted-foreground/30")} />
        {(filled || half) && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: half ? "50%" : "100%" }}
          >
            <Star className={cn(sizeClass, "fill-warning text-warning")} />
          </span>
        )}
      </span>
    );

    if (readonly) return <span key={i}>{Icon}</span>;
    return (
      <button
        key={i}
        type="button"
        onMouseEnter={() => setHover(i)}
        onMouseLeave={() => setHover(null)}
        onClick={() => onChange?.(i)}
        className="focus:outline-none focus:ring-2 focus:ring-primary rounded-sm transition-transform hover:scale-110"
        aria-label={`${i} তারকা`}
      >
        {Icon}
      </button>
    );
  });

  const shouldShowValue = showValue ?? readonly;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" role={readonly ? "img" : "radiogroup"} aria-label="রেটিং">
        {stars}
      </div>
      {shouldShowValue && value > 0 && (
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
      {typeof count === "number" && count > 0 && (
        <span className="text-xs text-muted-foreground">
          ({count}টি রিভিউ)
        </span>
      )}
    </div>
  );
};

export default ReviewRating;
