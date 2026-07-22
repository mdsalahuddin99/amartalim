import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { updateBlog } from "@/server/actions/blog.actions";
import { type ManagedBlogPost } from "@/types/blog";
import { BlogListItem } from "./BlogListItem";
import { useRouter } from "next/navigation";

interface Props {
  posts: ManagedBlogPost[];
  selected: Set<string>;
  onSelected: (next: Set<string>) => void;
  onEdit: (p: ManagedBlogPost) => void;
  onDelete: (p: ManagedBlogPost) => void;
}

export const BlogList = ({ posts, selected, onSelected, onEdit, onDelete }: Props) => {
  const router = useRouter();

  if (posts.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        <div className="py-16 text-center text-sm text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
          কোন ব্লগ পাওয়া যায়নি
        </div>
      </div>
    );
  }

  const allChecked = posts.every((p) => selected.has(p.id));

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 bg-muted/30">
        <Checkbox
          checked={allChecked}
          onCheckedChange={(v) => onSelected(v ? new Set(posts.map((p) => p.id)) : new Set())}
        />
        <span className="text-xs text-muted-foreground">সব নির্বাচন</span>
      </div>
      <ul className="divide-y divide-border/50">
        {posts.map((p) => (
          <BlogListItem
            key={p.id}
            post={p}
            checked={selected.has(p.id)}
            onCheck={(v) => {
              const next = new Set(selected);
              if (v) next.add(p.id); else next.delete(p.id);
              onSelected(next);
            }}
            onToggleFeatured={async () => {
              await updateBlog(p.id, { featured: !p.featured } as any);
              toast({ title: p.featured ? "ফিচার্ড থেকে সরানো হলো" : "ফিচার্ড হিসেবে চিহ্নিত" });
              router.refresh();
            }}
            onPublish={async () => { 
              await updateBlog(p.id, { published: true } as any); 
              toast({ title: "প্রকাশিত হয়েছে" }); 
              router.refresh();
            }}
            onEdit={() => onEdit(p)}
            onDelete={() => onDelete(p)}
          />
        ))}
      </ul>
    </div>
  );
};
