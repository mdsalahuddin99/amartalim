import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
const RichEditor = dynamic(() => import("@/components/admin/RichEditor").then(m => m.RichEditor), { 
  ssr: false, 
  loading: () => <div className="p-4 border rounded-xl text-center text-sm bg-muted/20">এডিটর লোড হচ্ছে...</div> 
});
import { slugify, type ManagedBlogPost } from "@/types/blog";
import type { BlogFieldErrors } from "./useBlogDraft";
import { cn } from "@/lib/utils";

interface Props {
  draft: Partial<ManagedBlogPost>;
  isEditing: boolean;
  errors?: BlogFieldErrors;
  onChange: (patch: Partial<ManagedBlogPost>) => void;
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

export const BlogFormMain = ({ draft, isEditing, errors = {}, onChange }: Props) => (
  <div className="space-y-5 min-w-0">
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">শিরোনাম *</Label>
      <Input
        value={draft.title || ""}
        onChange={(e) =>
          onChange({
            title: e.target.value,
            slug: isEditing ? draft.slug : slugify(e.target.value),
          })
        }
        placeholder="আকর্ষণীয় শিরোনাম..."
        aria-invalid={!!errors.title}
        className={cn(
          "text-2xl sm:text-3xl font-bold h-auto py-3 px-3 border-border/50",
          errors.title && "border-destructive focus-visible:ring-destructive",
        )}
      />
      <FieldError msg={errors.title} />
    </div>

    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">সারসংক্ষেপ</Label>
      <Textarea
        rows={2}
        value={draft.excerpt || ""}
        onChange={(e) => onChange({ excerpt: e.target.value })}
        placeholder="২-৩ লাইনের সারাংশ যা ব্লগ লিস্ট ও SEO তে দেখাবে।"
        aria-invalid={!!errors.excerpt}
        className={cn(errors.excerpt && "border-destructive focus-visible:ring-destructive")}
      />
      <FieldError msg={errors.excerpt} />
    </div>

    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">কন্টেন্ট *</Label>
      <div className={cn(errors.content && "ring-1 ring-destructive rounded-md")}>
        <RichEditor value={draft.content || ""} onChange={(html) => onChange({ content: html })} />
      </div>
      <FieldError msg={errors.content} />
    </div>
  </div>
);
