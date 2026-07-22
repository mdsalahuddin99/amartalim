import { z } from "zod";

export const noteSaveSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  body: z.string().max(5000, "নোট সর্বোচ্চ ৫০০০ অক্ষর হতে পারে"),
});

export type NoteSaveInput = z.infer<typeof noteSaveSchema>;
