import { z } from "zod";

export const courseCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  thumbnail: z.string().url().optional(),
  price: z.number().int().min(0).default(0),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
});

export const lessonCreateSchema = z.object({
  courseId: z.string(),
  title: z.string().min(3),
  description: z.string().optional(),
  videoId: z.string().optional(),
  duration: z.number().int().optional(),
  order: z.number().int(),
  isFreePreview: z.boolean().default(false),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
