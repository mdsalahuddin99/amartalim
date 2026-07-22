"use client";
import { useEffect, useState } from "react";
import type { LessonNote } from "@/types/order";
import { api } from "@/lib/api-client";
import { driver, driverEvent } from "@/lib/data-driver";

/**
 * Per-user lesson notes — backend-ready.
 * Reads sync via `driver`; mutations through `api.*` → `/notes` mock.
 * Post-migration → Prisma `LessonNote` table.
 */
const RES = "notes";
const EVT = driverEvent(RES);
const cache = () => driver.list<LessonNote>(RES);

export const notesStore = {
  get(userId: string, lessonId: string): LessonNote | undefined {
    return cache().find((n) => n.userId === userId && n.lessonId === lessonId);
  },
  forUser(userId: string): LessonNote[] {
    return cache()
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  async save(userId: string, courseId: string, lessonId: string, body: string): Promise<LessonNote> {
    return api.post<LessonNote>("/notes", { userId, courseId, lessonId, body });
  },
  async remove(userId: string, lessonId: string): Promise<void> {
    await api.del("/notes", { userId, lessonId });
  },
};

export function useLessonNote(userId: string | undefined, lessonId: string) {
  const [note, setNote] = useState<LessonNote | undefined>(() =>
    userId ? notesStore.get(userId, lessonId) : undefined,
  );
  useEffect(() => {
    const refresh = () => setNote(userId ? notesStore.get(userId, lessonId) : undefined);
    refresh();
    return driver.subscribe(RES, refresh);
  }, [userId, lessonId]);
  void EVT;
  return note;
}
