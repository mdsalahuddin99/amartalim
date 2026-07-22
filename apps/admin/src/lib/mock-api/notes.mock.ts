import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { LessonNote } from "@/types/order";

const RES = "notes";
const read = () => driver.list<LessonNote>(RES);
const write = (xs: LessonNote[]) => driver.save(RES, xs);

export const registerNotesMocks = () => {
  registerMock("GET", /^\/notes$/, (req) => {
    const userId = req.query.userId ?? "";
    return ok(read().filter((n) => !userId || n.userId === userId));
  });
  registerMock("POST", /^\/notes$/, (req) => {
    const { userId, courseId, lessonId, body } = req.body as {
      userId: string; courseId: string; lessonId: string; body: string;
    };
    const list = read();
    const now = new Date().toISOString();
    const idx = list.findIndex((n) => n.userId === userId && n.lessonId === lessonId);
    if (idx === -1) {
      const note: LessonNote = {
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId, courseId, lessonId, body, updatedAt: now,
      };
      write([...list, note]);
      return ok(note);
    }
    const updated = { ...list[idx], body, updatedAt: now };
    list[idx] = updated;
    write(list);
    return ok(updated);
  });
  registerMock("DELETE", /^\/notes$/, (req) => {
    const { userId, lessonId } = (req.body ?? req.query) as { userId: string; lessonId: string };
    write(read().filter((n) => !(n.userId === userId && n.lessonId === lessonId)));
    return ok(null);
  });
};
