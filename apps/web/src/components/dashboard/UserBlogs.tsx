"use client";

import { useMemo, useState } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { type ManagedBlogPost, type BlogStatus } from "@/types/blog";
import { deleteUserBlog as deleteBlog } from "@/server/actions/user-blog.actions";
import { type BlogCategory, type Author } from "@prisma/client";
import {
  BlogStatCards, BlogFilters, BlogBulkBar, BlogList, BlogDeleteDialogs,
  BlogFormHeader, BlogFormMain, BlogFormSidebar, useBlogDraft,
  type BlogTab,
} from "./blogs";

/**
 * User Blogs — composition shell for student dashboard.
 */
const UserBlogs = ({ initialPosts, initialCategories, authors }: { initialPosts: ManagedBlogPost[], initialCategories: BlogCategory[], authors: Author[] }) => {
  const posts = initialPosts;
  const blogCategories = initialCategories;
  const form = useBlogDraft(blogCategories as any);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<BlogTab>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<ManagedBlogPost | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const filtered = useMemo(() => {
    return posts
      .filter((p) => (tab === "all" ? true : p.status === tab))
      .filter((p) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [posts, tab, query]);

  const counts = useMemo<Record<BlogTab, number>>(() => ({
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    pending: posts.filter((p) => p.status === "pending").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published").length,
  }), [posts]);

  const runBulk = async (fn: (id: string) => Promise<any>, title: string) => {
    const promises = Array.from(selected).map(id => fn(id));
    await Promise.all(promises);
    toast({ title: title.replace("{n}", String(selected.size)) });
    setSelected(new Set());
    router.refresh();
  };

  if (form.isOpen) {
    return (
      <div className="space-y-5">
        <BlogFormHeader
          isEditing={!!form.editing}
          title={form.draft.title || ""}
          content={form.draft.content || ""}
          canSchedule={!!form.scheduleAt}
          isSubmitting={form.isSubmitting}
          onClose={form.close}
          onSaveDraft={form.saveDraft}
          onSchedule={form.schedulePost}
          onPublish={form.publishNow}
        />
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <BlogFormMain
            draft={form.draft}
            isEditing={!!form.editing}
            errors={form.errors}
            onChange={form.setDraft}
          />
          <BlogFormSidebar
            draft={form.draft}
            onChange={form.setDraft}
            scheduleAt={form.scheduleAt}
            onScheduleAt={form.setScheduleAt}
            tagsText={form.tagsText}
            onTagsText={form.setTagsText}
            blogCategories={blogCategories}
            authors={authors}
            errors={form.errors}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ব্লগ ব্যবস্থাপনা</h1>
          <p className="text-sm text-muted-foreground mt-1">ড্রাফট তৈরি, এডিট ও প্রকাশের সময় নির্ধারণ করুন</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={form.openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> নতুন ব্লগ
          </Button>
        </div>
      </div>

      <BlogStatCards counts={counts} tab={tab} onTab={setTab} />
      <BlogFilters query={query} onQuery={setQuery} tab={tab} onTab={setTab} />

      <BlogBulkBar
        count={selected.size}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => setSelected(new Set())}
      />

      <BlogList
        posts={filtered}
        selected={selected}
        onSelected={setSelected}
        onEdit={form.openEdit}
        onDelete={setConfirmDelete}
      />

      <BlogDeleteDialogs
        confirmDelete={confirmDelete}
        onConfirmDelete={setConfirmDelete}
        onDeleteSingle={async () => {
          if (confirmDelete) {
            await deleteBlog(confirmDelete.id);
            toast({ title: "মুছে ফেলা হয়েছে" });
            router.refresh();
          }
          setConfirmDelete(null);
        }}
        bulkOpen={confirmBulkDelete}
        bulkCount={selected.size}
        onBulkOpenChange={setConfirmBulkDelete}
        onDeleteBulk={async () => {
          const promises = Array.from(selected).map(id => deleteBlog(id));
          await Promise.all(promises);
          toast({ title: `${selected.size} টি মুছে ফেলা হয়েছে` });
          setSelected(new Set());
          setConfirmBulkDelete(false);
          router.refresh();
        }}
      />
    </div>
  );
};

export type { BlogStatus };
export default UserBlogs;
