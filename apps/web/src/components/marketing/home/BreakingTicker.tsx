import { Link } from "@/lib/navigation";

export interface BreakingTickerItem {
  title: string;
  slug: string;
}

export interface BreakingTickerProps {
  items: BreakingTickerItem[];
}

/** Top breaking-news ticker strip. Pure presentational. */
export const BreakingTicker = ({ items }: BreakingTickerProps) => (
  <div className="border-y border-foreground/10 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-10 overflow-hidden">
      <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        ব্রেকিং
      </span>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex gap-10 whitespace-nowrap">
          {[...items, ...items].map((it, i) => (
            <Link
              key={i}
              to={`/blogs/${it.slug}`}
              className="text-[13px] italic text-foreground/80 hover:text-primary shrink-0 flex items-center gap-3"
            >
              <span className="text-accent">◆</span> {it.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default BreakingTicker;
