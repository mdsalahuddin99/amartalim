import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { formatBlogDate } from "@/lib/seed/blog-data";
import { slugify, type ManagedBlogPost } from "@/types/blog";
import { type BlogCategory } from "@prisma/client";
import {
  blogDraftSchema, blogScheduleSchema, zodToFieldErrors, firstZodMessage,
} from "@/lib/validators/blog";
import { emptyDraft, labelForCategory, plainTextLen, toDatetimeLocal } from "./constants";
import { createBlog, updateBlog } from "@/server/actions/blog.actions";

export type BlogFieldErrors = Record<string, string>;

export interface UseBlogDraft {
  editing: ManagedBlogPost | null;
  creating: boolean;
  draft: Partial<ManagedBlogPost>;
  tagsText: string;
  scheduleAt: string;
  errors: BlogFieldErrors;
  isOpen: boolean;
  isSubmitting: boolean;
  setDraft: (patch: Partial<ManagedBlogPost>) => void;
  setTagsText: (v: string) => void;
  setScheduleAt: (v: string) => void;
  openCreate: () => void;
  openEdit: (p: ManagedBlogPost) => void;
  close: () => void;
  saveDraft: () => Promise<void>;
  publishNow: () => Promise<void>;
  schedulePost: () => Promise<void>;
}

export function useBlogDraft(blogCategories: BlogCategory[]): UseBlogDraft {
  const [editing, setEditing] = useState<ManagedBlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraftState] = useState<Partial<ManagedBlogPost>>(emptyDraft());
  const [tagsText, setTagsText] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [errors, setErrors] = useState<BlogFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setDraft = (patch: Partial<ManagedBlogPost>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
    // Clear errors for changed fields so the UI feels responsive.
    if (Object.keys(errors).length) {
      setErrors((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(patch)) delete next[key];
        return next;
      });
    }
  };

  const resetForm = () => {
    setDraftState(emptyDraft());
    setTagsText("");
    setScheduleAt("");
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (p: ManagedBlogPost) => {
    setDraftState({ ...p });
    setTagsText((p.tags || []).join(", "));
    setScheduleAt(toDatetimeLocal(p.publishAt));
    setErrors({});
    setCreating(false);
    setEditing(p);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
    resetForm();
  };

  const buildValidatable = () => {
    const cat = blogCategories.find((c) => c.id === draft.categoryId) || blogCategories[0];
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    return {
      title: draft.title || "",
      slug: (draft.slug?.trim() || slugify(draft.title || "")) as string,
      excerpt: draft.excerpt || "",
      content: draft.content || "",
      categoryId: cat?.id || draft.categoryId || "",
      cover: draft.cover || "",
      authorProfileId: draft.authorProfileId || "",
      tags,
    };
  };

  const buildPayload = (validated: {
    title: string; slug: string; excerpt?: string; content: string;
    categoryId: string; cover?: string; tags: string[]; authorProfileId?: string;
  }): Partial<ManagedBlogPost> => {
    const cat = blogCategories.find((c) => c.id === validated.categoryId) || blogCategories[0];
    return {
      ...draft,
      title: validated.title.trim(),
      slug: validated.slug,
      excerpt: validated.excerpt || "",
      content: validated.content,
      categoryId: cat?.id,
      categoryName: cat ? labelForCategory(cat, blogCategories) : draft.categoryName,
      cover: validated.cover || "/placeholder.svg",
      authorProfileId: validated.authorProfileId,
      tags: validated.tags,
      readTime: Math.max(2, Math.ceil(plainTextLen(validated.content) / 1200)),
    };
  };

  const runValidation = (
    schema: typeof blogDraftSchema | typeof blogScheduleSchema,
    extra?: Record<string, unknown>,
  ) => {
    const data = { ...buildValidatable(), ...(extra || {}) };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = zodToFieldErrors(parsed.error);
      setErrors(fieldErrors);
      toast({
        title: "ফর্মে ত্রুটি রয়েছে",
        description: firstZodMessage(parsed.error),
        variant: "destructive",
      });
      return null;
    }
    setErrors({});
    return parsed.data;
  };

  const runAction = async <T,>(fn: () => T | Promise<T>, errMsg: string) => {
    setIsSubmitting(true);
    try {
      await fn();
    } catch (err) {
      console.error("[blog-draft]", err);
      toast({
        title: errMsg,
        description: err instanceof Error ? err.message : "অজানা ত্রুটি",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    const validated = runValidation(blogDraftSchema);
    if (!validated) return;
    await runAction(async () => {
      const payload = buildPayload(validated as any);
      if (editing) {
        const res = await updateBlog(editing.id, { ...payload, published: false, publishAt: "" } as any);
        if (!res.ok) throw new Error(res.error || "Failed to update draft");
        toast({ title: "ড্রাফট সংরক্ষিত হয়েছে" });
      } else {
        const res = await createBlog({ ...payload, published: false } as any);
        if (!res.ok) throw new Error(res.error || "Failed to create draft");
        toast({ title: "ড্রাফট তৈরি হয়েছে" });
      }
      close();
      window.location.reload(); // Refresh the page to fetch new data from the server
    }, "সংরক্ষণ ব্যর্থ হয়েছে");
  };

  const publishNow = async () => {
    const validated = runValidation(blogDraftSchema);
    if (!validated) return;
    await runAction(async () => {
      const payload = buildPayload(validated as any);
      if (editing) {
        const res = await updateBlog(editing.id, { ...payload, published: true, publishAt: "" } as any);
        if (!res.ok) throw new Error(res.error || "Failed to publish");
        toast({ title: "প্রকাশিত হয়েছে" });
      } else {
        const res = await createBlog({ ...payload, published: true } as any);
        if (!res.ok) throw new Error(res.error || "Failed to publish blog");
        toast({ title: "ব্লগ প্রকাশিত হয়েছে" });
      }
      close();
      window.location.reload();
    }, "প্রকাশ ব্যর্থ হয়েছে");
  };

  const schedulePost = async () => {
    const iso = scheduleAt ? new Date(scheduleAt).toISOString() : "";
    const validated = runValidation(blogScheduleSchema, { publishAt: iso });
    if (!validated) return;
    await runAction(async () => {
      const payload = buildPayload(validated as any);
      if (editing) {
        const res = await updateBlog(editing.id, { ...payload, published: false, publishAt: iso } as any);
        if (!res.ok) throw new Error(res.error || "Failed to schedule");
        toast({ title: "নির্ধারিত হয়েছে", description: `প্রকাশ হবে: ${formatBlogDate(iso)}` });
      } else {
        const res = await createBlog({ ...payload, published: false, publishAt: iso } as any);
        if (!res.ok) throw new Error(res.error || "Failed to schedule blog");
        toast({ title: "ব্লগ নির্ধারিত হয়েছে" });
      }
      close();
      window.location.reload();
    }, "সময় নির্ধারণ ব্যর্থ হয়েছে");
  };

  return {
    editing, creating, draft, tagsText, scheduleAt, errors,
    isOpen: creating || !!editing,
    isSubmitting,
    setDraft, setTagsText, setScheduleAt,
    openCreate, openEdit, close,
    saveDraft, publishNow, schedulePost,
  };
}
