"use client";
import type { LessonNote } from "@/types/order";
import { saveLessonNote, deleteLessonNote } from "@/server/actions/note.actions";

export const notesStore = {
  get(userId: string, lessonId: string): LessonNote | undefined {
    return undefined;
  },
  forUser(userId: string): LessonNote[] {
    return [];
  },
  async save(userId: string, courseId: string, lessonId: string, body: string): Promise<LessonNote | null> {
    const res = await saveLessonNote(null, { courseId, lessonId, body });
    return res.ok ? res.data : null;
  },
  async remove(userId: string, lessonId: string): Promise<void> {
    await deleteLessonNote(null, lessonId);
  },
};

export function useLessonNote(userId: string | undefined, lessonId: string) {
  return undefined;
}
