import { z } from "zod";
import { EXPERTISE_OPTIONS } from "@/types/author";

const optionalUrl = z
  .string()
  .trim()
  .url({ message: "সঠিক URL দিন" })
  .max(255)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const authorApplicationSchema = z.object({
  name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষর").max(100),
  email: z.string().trim().email("সঠিক ইমেইল দিন").max(255),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  avatar: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  bio: z.string().trim().min(30, "বিস্তারিত পরিচয় কমপক্ষে ৩০ অক্ষর").max(2000),
  shortBio: z
    .string()
    .trim()
    .max(220, "Short bio সর্বোচ্চ ২২০ অক্ষর")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  expertise: z
    .array(z.enum(EXPERTISE_OPTIONS))
    .min(1, "অন্তত একটি দক্ষতা বাছাই করুন")
    .max(7),
  facebook: optionalUrl,
  twitter: optionalUrl,
  website: optionalUrl,
});

export type AuthorApplicationInput = z.infer<typeof authorApplicationSchema>;

export const reviewNoteSchema = z.object({
  reviewNote: z.string().trim().min(5, "কারণ লিখুন").max(500),
});

export const authorAdminCreateSchema = z.object({
  name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষর").max(100),
  email: z.string().trim().email("সঠিক ইমেইল দিন").max(255),
  slug: z.string().trim().min(2, "স্লাগ কমপক্ষে ২ অক্ষর"),
  phone: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
  avatar: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  bio: z.string().trim().min(1, "বিস্তারিত পরিচয় দিন").max(2000),
  shortBio: z.string().trim().max(220).optional().or(z.literal("").transform(() => undefined)),
  expertise: z.array(z.string()).default([]),
  facebook: optionalUrl,
  twitter: optionalUrl,
  website: optionalUrl,
});

export type AuthorAdminCreateInput = z.infer<typeof authorAdminCreateSchema>;
export const authorAdminUpdateSchema = authorAdminCreateSchema.partial();
export type AuthorAdminUpdateInput = z.infer<typeof authorAdminUpdateSchema>;
