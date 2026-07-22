import { CalendarClock, Edit2, Eye, Send, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/lib/navigation";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { ManagedBlogPost } from "@/types/blog";
import { statusMeta } from "./constants";

interface Props {
  post: ManagedBlogPost;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onToggleFeatured: () => void;
  onPublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const BlogListItem = ({ post: p, checked, onCheck, onToggleFeatured, onPublish, onEdit, onDelete }: Props) => (
  <li className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:bg-muted/30 transition-colors">
    <Checkbox className="mt-2 shrink-0" checked={checked} onCheckedChange={(v) => onCheck(!!v)} />
    <img
      src={p.cover}
      alt={p.title}
      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md shrink-0 border border-border/40"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <Badge className={statusMeta[p.status]?.cls || "bg-muted"} variant="secondary">{statusMeta[p.status]?.label || p.status}</Badge>
        {p.featured && (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400" variant="secondary">
            <Star className="h-2.5 w-2.5 mr-1 fill-current" /> ফিচার্ড
          </Badge>
        )}
        <span className="text-[11px] text-muted-foreground">{p.categoryName}</span>
        {p.status === "scheduled" && p.publishAt && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> {formatBlogDate(p.publishAt)}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2">{p.title}</h3>
      {p.excerpt && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">{p.excerpt}</p>}
      <div className="text-[11px] text-muted-foreground mt-1.5">
        {formatBlogDate(p.updatedAt)} · {p.readTime} মিনিট পড়া
      </div>
    </div>
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 shrink-0">
      <Button variant="ghost" size="icon" className="h-8 w-8" title={p.featured ? "ফিচার্ড থেকে সরান" : "ফিচার্ড করুন"} onClick={onToggleFeatured}>
        <Star className={`h-4 w-4 ${p.featured ? "text-amber-500 fill-amber-500" : ""}`} />
      </Button>
      {p.status === "published" && (
        <Link to={`/blogs/${p.slug}`} target="_blank">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="প্রিভিউ"><Eye className="h-4 w-4" /></Button>
        </Link>
      )}
      {p.status !== "published" && (
        <Button variant="ghost" size="icon" className="h-8 w-8" title="এখনই প্রকাশ" onClick={onPublish}>
          <Send className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="এডিট"><Edit2 className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete} title="মুছুন">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </li>
);
