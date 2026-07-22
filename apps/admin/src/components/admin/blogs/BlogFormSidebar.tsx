import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleHelp, ListTree, Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { createBlogCategory } from "@/server/actions/blog-category.actions";
import { CloudinaryUploader } from "../CloudinaryUploader";
import type { ManagedBlogPost } from "@/types/blog";
import type { ManagedBlogCategory } from "@/types/blog";
import type { Author } from "@prisma/client";
import { labelForCategory } from "./constants";
import type { BlogFieldErrors } from "./useBlogDraft";
import { cn } from "@/lib/utils";

interface Props {
  draft: Partial<ManagedBlogPost>;
  onChange: (patch: Partial<ManagedBlogPost>) => void;
  scheduleAt: string;
  onScheduleAt: (v: string) => void;
  tagsText: string;
  onTagsText: (v: string) => void;
  blogCategories: ManagedBlogCategory[];
  authors: Author[];
  errors?: BlogFieldErrors;
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-[11px] text-destructive">{msg}</p> : null;

export const BlogFormSidebar = ({
  draft, onChange, scheduleAt, onScheduleAt, tagsText, onTagsText, blogCategories, authors, errors = {},
}: Props) => {
  const router = useRouter();
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const [tagInput, setTagInput] = useState("");
  const tagsArray = tagsText.split(",").map(t => t.trim()).filter(Boolean);

  const addTag = (t: string) => {
    if (t && !tagsArray.includes(t)) {
      onTagsText([...tagsArray, t].join(", "));
    }
    setTagInput("");
  };

  const removeTag = (t: string) => {
    onTagsText(tagsArray.filter(tag => tag !== t).join(", "));
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setIsSubmittingCat(true);
    try {
      const res = await createBlogCategory({ name: newCatName.trim() });
      if (res.ok && res.data) {
        toast({ title: "ক্যাটাগরি তৈরি হয়েছে" });
        onChange({ categoryId: res.data.id });
        setIsCreatingCat(false);
        setNewCatName("");
        router.refresh();
      } else {
        toast({ title: "ক্যাটাগরি তৈরি ব্যর্থ হয়েছে", description: res.error || "", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "ত্রুটি", description: "ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    }
    setIsSubmittingCat(false);
  };

  return (
    <aside className="space-y-5">
    <div className="p-4 rounded-xl border border-border/50 bg-card space-y-4">
      <h3 className="text-sm font-semibold">প্রকাশনা</h3>
      <div className="space-y-1.5">
        <Label className="text-xs">প্রকাশের সময় (ঐচ্ছিক)</Label>
        <Input
          type="datetime-local"
          value={scheduleAt}
          onChange={(e) => onScheduleAt(e.target.value)}
          aria-invalid={!!errors.publishAt}
          className={cn(errors.publishAt && "border-destructive focus-visible:ring-destructive")}
        />
        <FieldError msg={errors.publishAt} />
        <p className="text-[11px] text-muted-foreground">এই সময়ে স্বয়ংক্রিয়ভাবে প্রকাশিত হবে।</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">স্লাগ (URL)</Label>
        <Input
          value={draft.slug || ""}
          onChange={(e) => onChange({ slug: e.target.value })}
          className={cn("font-mono text-xs", errors.slug && "border-destructive focus-visible:ring-destructive")}
          placeholder="auto-generated"
          aria-invalid={!!errors.slug}
        />
        <FieldError msg={errors.slug} />
      </div>
    </div>

    <div className="p-4 rounded-xl border border-border/50 bg-card space-y-4">
      <h3 className="text-sm font-semibold">ক্যাটাগরি ও মেটা</h3>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">ক্যাটাগরি</Label>
          {!isCreatingCat && (
            <Button type="button" variant="ghost" size="sm" className="h-5 px-1 text-[10px]" onClick={() => setIsCreatingCat(true)}>
              + নতুন
            </Button>
          )}
        </div>
        {isCreatingCat ? (
          <div className="flex items-center gap-2 mt-1">
            <Input 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              placeholder="নতুন ক্যাটাগরি" 
              className="h-9 text-xs" 
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateCategory();
                }
              }}
            />
            <Button type="button" size="sm" onClick={handleCreateCategory} disabled={isSubmittingCat}>সেভ</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsCreatingCat(false)}>বাতিল</Button>
          </div>
        ) : (
          <Select value={draft.categoryId} onValueChange={(v) => onChange({ categoryId: v })}>
            <SelectTrigger
              aria-invalid={!!errors.categoryId}
              className={cn(errors.categoryId && "border-destructive")}
            ><SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>
              {blogCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.parentId ? "↳ " : ""}{labelForCategory(c, blogCategories)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <FieldError msg={errors.categoryId} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">লেখক</Label>
        <Select value={draft.authorProfileId} onValueChange={(v) => onChange({ authorProfileId: v })}>
          <SelectTrigger
            aria-invalid={!!errors.authorProfileId}
            className={cn(errors.authorProfileId && "border-destructive")}
          ><SelectValue placeholder="লেখক নির্বাচন করুন" /></SelectTrigger>
          <SelectContent>
            {authors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError msg={errors.authorProfileId} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">ট্যাগ</Label>
        {tagsArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagsArray.map(t => (
              <Badge key={t} variant="secondary" className="text-[10px] font-normal px-1.5 py-0.5 flex items-center gap-1">
                {t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-destructive shrink-0">
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input 
          value={tagInput} 
          onChange={(e) => setTagInput(e.target.value)} 
          placeholder="ট্যাগ লিখে Enter চাপুন" 
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(tagInput.trim().replace(/,/g, ""));
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Star className={`h-4 w-4 ${draft.featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
          <Label className="text-xs cursor-pointer" htmlFor="featured-toggle">ফিচার্ড পোস্ট</Label>
        </div>
        <Switch
          id="featured-toggle"
          checked={!!draft.featured}
          onCheckedChange={(v) => onChange({ featured: v })}
        />
      </div>
    </div>

    <div className="p-4 rounded-xl border border-border/50 bg-card">
      <CloudinaryUploader
        value={draft.cover}
        onChange={(url) => onChange({ cover: url })}
        label="কভার ইমেজ"
      />
    </div>

    <div className="p-4 rounded-xl border border-border/50 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">সূচিপত্র</h3>
        </div>
        <Switch checked={draft.showToc !== false} onCheckedChange={(v) => onChange({ showToc: v })} />
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        H2/H3 হেডিং থেকে স্বয়ংক্রিয়ভাবে সূচিপত্র তৈরি হবে এবং ডান সাইডবারে দেখাবে।
      </p>
    </div>

    <div className="p-4 rounded-xl border border-border/50 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleHelp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">প্রায়শই জিজ্ঞাসা (FAQ)</h3>
        </div>
        <Button
          type="button" size="sm" variant="outline" className="h-7 gap-1"
          onClick={() => {
            const currentFaq = draft.faq || [];
            onChange({ faq: [...currentFaq, { q: "", a: "" }] });
            setExpandedFaqIndex(currentFaq.length);
          }}
        >
          <Plus className="h-3 w-3" /> যোগ
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        FAQ যোগ করলে FAQPage JSON-LD স্কিমা তৈরি হয় — Google ও AI chatbot এর জন্য গুরুত্বপূর্ণ।
      </p>
      <div className="space-y-3">
        {(draft.faq || []).map((item, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-2.5 space-y-2 bg-muted/30 transition-all">
            <div 
              className="flex items-center justify-between cursor-pointer select-none" 
              onClick={() => setExpandedFaqIndex(expandedFaqIndex === i ? null : i)}
            >
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold inline-block mr-2">প্রশ্ন #{i + 1}</span>
                {expandedFaqIndex !== i && item.q && (
                  <span className="text-xs text-foreground truncate inline-block align-bottom max-w-[200px]">
                    {item.q}
                  </span>
                )}
              </div>
              <Button
                type="button" size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ faq: (draft.faq || []).filter((_, j) => j !== i) });
                  if (expandedFaqIndex === i) setExpandedFaqIndex(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {expandedFaqIndex === i && (
              <div className="space-y-2 pt-1 border-t border-border/40 mt-2">
                <Input
                  value={item.q}
                  onChange={(e) => {
                    const next = [...(draft.faq || [])];
                    next[i] = { ...next[i], q: e.target.value };
                    onChange({ faq: next });
                  }}
                  placeholder="প্রশ্ন লিখুন..."
                  className="text-sm bg-background"
                  onClick={(e) => e.stopPropagation()}
                />
                <Textarea
                  rows={3}
                  value={item.a}
                  onChange={(e) => {
                    const next = [...(draft.faq || [])];
                    next[i] = { ...next[i], a: e.target.value };
                    onChange({ faq: next });
                  }}
                  placeholder="উত্তর লিখুন..."
                  className="text-sm bg-background"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        ))}
        {(!draft.faq || draft.faq.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-3 border border-dashed border-border/60 rounded-lg">
            কোনো FAQ যোগ করা হয়নি
          </p>
        )}
      </div>
    </div>
  </aside>
  );
};
