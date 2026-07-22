"use server";

import { noteSaveSchema, type NoteSaveInput } from "@/lib/validators/note";
import { auth } from "@/server/auth/auth";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function saveLessonNote(
  // @ts-ignore
  _user: any,
  input: NoteSaveInput,
): Promise<ActionResult<any>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "নোট সংরক্ষণ করতে লগইন করুন।" };
  
  // Note: Prisma schema does not currently have a Note model.
  // This is a placeholder for future implementation.
  return { ok: false, error: "Note taking is not supported in the database yet." };
}

export async function deleteLessonNote(
  // @ts-ignore
  _user: any,
  lessonId: string,
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "লগইন প্রয়োজন।" };
  
  return { ok: false, error: "Note taking is not supported in the database yet." };
}
