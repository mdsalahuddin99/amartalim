import { z } from "zod";

export const commentCreateSchema = z.object({
  blogId: z.string().min(1),
  parentId: z.string().nullable().optional(),
  body: z
    .string()
    .trim()
    .min(2, "মন্তব্য খুব ছোট")
    .max(2000, "মন্তব্য সর্বোচ্চ ২০০০ অক্ষর হতে পারে"),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
