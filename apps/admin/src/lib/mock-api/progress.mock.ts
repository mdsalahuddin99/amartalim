import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { QuizAttemptRecord } from "@/types/order";

interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  updatedAt: string;
}

const PROGRESS = "progress";
const ATTEMPTS = "quiz-attempts";

export const registerProgressMocks = () => {
  // GET /progress?userId=...
  registerMock("GET", /^\/progress$/, (req) => {
    const userId = req.query.userId ?? "";
    return ok(driver.list<CourseProgress>(PROGRESS).filter((p) => !userId || p.userId === userId));
  });

  // POST /progress/toggle
  registerMock("POST", /^\/progress\/toggle$/, (req) => {
    const { userId, courseId, lessonId } = req.body as {
      userId: string; courseId: string; lessonId: string;
    };
    const list = driver.list<CourseProgress>(PROGRESS);
    const now = new Date().toISOString();
    const idx = list.findIndex((p) => p.userId === userId && p.courseId === courseId);
    if (idx === -1) {
      list.push({ userId, courseId, completedLessons: [lessonId], updatedAt: now });
    } else {
      const cur = list[idx];
      const has = cur.completedLessons.includes(lessonId);
      list[idx] = {
        ...cur,
        completedLessons: has
          ? cur.completedLessons.filter((id) => id !== lessonId)
          : [...cur.completedLessons, lessonId],
        updatedAt: now,
      };
    }
    driver.save(PROGRESS, list);
    return ok(list.find((p) => p.userId === userId && p.courseId === courseId) ?? null);
  });

  // GET /quiz-attempts?userId=...
  registerMock("GET", /^\/quiz-attempts$/, (req) => {
    const userId = req.query.userId ?? "";
    return ok(driver.list<QuizAttemptRecord>(ATTEMPTS).filter((a) => !userId || a.userId === userId));
  });

  // POST /quiz-attempts
  registerMock("POST", /^\/quiz-attempts$/, (req) => {
    const rec = req.body as QuizAttemptRecord;
    driver.save(ATTEMPTS, [...driver.list<QuizAttemptRecord>(ATTEMPTS), rec]);
    return ok(rec);
  });
};
