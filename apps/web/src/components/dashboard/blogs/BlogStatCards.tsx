import type { BlogStatus } from "@/types/blog";
import { statusMeta } from "./constants";

export type BlogTab = "all" | BlogStatus;

interface Props {
  counts: Record<BlogTab, number>;
  tab: BlogTab;
  onTab: (t: BlogTab) => void;
}

export const BlogStatCards = ({ counts, tab, onTab }: Props) => (
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
    {(["all", "draft", "pending", "scheduled", "published"] as const).map((k) => (
      <button
        key={k}
        onClick={() => onTab(k)}
        className={`p-4 rounded-2xl border text-left transition-colors ${
          tab === k ? "border-primary bg-primary/5" : "border-border/50 bg-card hover:bg-secondary"
        }`}
      >
        <div className="text-2xl font-bold">{counts[k]}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {k === "all" ? "মোট" : statusMeta[k].label}
        </div>
      </button>
    ))}
  </div>
);
