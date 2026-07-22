import { z } from "zod";

/**
 * Blog validation schemas — used by both admin form (useBlogDraft) and
 * future server actions. Slug allows Bengali/Arabic/Latin unicode + hyphens,
 * matching `slugify()` output in `src/lib/stores/blog-store.ts`.
 */
const SLUG_RE = /^[\u0980-\u09FF\u0600-\u06FFa-z0-9-]+$/;

const plainTextLen = (html: string) => html.replace(/<[^>]*>/g, "").trim().length;

export const blogDraftSchema = z.object({
  title: z
    .string({ required_error: "শিরোনাম প্রয়োজন" })
    .trim()
    .min(3, "শিরোনাম কমপক্ষে ৩ অক্ষর হতে হবে")
    .max(200, "শিরোনাম সর্বোচ্চ ২০০ অক্ষর"),
  slug: z
    .string({ required_error: "স্লাগ প্রয়োজন" })
    .trim()
    .min(3, "স্লাগ কমপক্ষে ৩ অক্ষর")
    .max(200, "স্লাগ সর্বোচ্চ ২০০ অক্ষর")
    .regex(SLUG_RE, "স্লাগে শুধু অক্ষর, সংখ্যা ও হাইফেন (-) ব্যবহার করুন"),
  excerpt: z.string().trim().max(300, "সারসংক্ষেপ সর্বোচ্চ ৩০০ অক্ষর").optional().or(z.literal("")),
  content: z
    .string({ required_error: "কন্টেন্ট প্রয়োজন" })
    .refine((html) => plainTextLen(html) >= 50, {
      message: "কন্টেন্ট কমপক্ষে ৫০ অক্ষর হতে হবে",
    }),
  categoryId: z.string().min(1, "ক্যাটাগরি নির্বাচন করুন"),
  categoryName: z.string().optional(),
  cover: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).max(20, "সর্বোচ্চ ২০টি ট্যাগ").default([]),
  featured: z.boolean().optional(),
  showToc: z.boolean().optional(),
  authorProfileId: z.string().min(1, "লেখক নির্বাচন করুন"),
  faq: z.array(z.object({
    q: z.string().trim().min(1),
    a: z.string().trim().min(1),
  })).optional(),
});

export const blogPublishSchema = blogDraftSchema;

export const blogScheduleSchema = blogDraftSchema.extend({
  publishAt: z
    .string()
    .min(1, "প্রকাশের সময় নির্বাচন করুন")
    .refine((iso) => !isNaN(new Date(iso).getTime()), "সঠিক তারিখ দিন")
    .refine((iso) => new Date(iso).getTime() > Date.now(), "ভবিষ্যতের সময় নির্বাচন করুন"),
});

export type BlogDraftInput = z.infer<typeof blogDraftSchema>;
export type BlogScheduleInput = z.infer<typeof blogScheduleSchema>;

export const blogCreateSchema = blogDraftSchema.extend({
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  publishAt: z.string().optional(),
  status: z.enum(["draft", "pending", "scheduled", "published"]).optional(),
});
export const blogUpdateSchema = blogDraftSchema.partial().extend({
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  publishAt: z.string().optional(),
  status: z.enum(["draft", "pending", "scheduled", "published"]).optional(),
});
export type BlogCreateInput = z.infer<typeof blogCreateSchema>;
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>;

/** Turn a ZodError into `{fieldPath: message}` for form field errors. */
export const zodToFieldErrors = (err: z.ZodError): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};

/** First error message — useful for toast summary. */
export const firstZodMessage = (err: z.ZodError): string =>
  err.issues[0]?.message ?? "ইনপুট যাচাই ব্যর্থ হয়েছে";
