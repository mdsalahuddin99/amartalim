import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import type {
  Course, Topic, Lesson, QuizMeta, Assignment, QuizQuestion,
} from "@/types/course";

export interface CourseSnapshot {
  course: Course;
  topics: Topic[];
  lessons: Lesson[];
  quizzes: QuizMeta[];
  assignments: Assignment[];
  quizQuestions: QuizQuestion[];
}

export interface DraftVersion {
  id: string;
  label: string;
  ts: number;
  snap: CourseSnapshot;
}

const DRAFTS_KEY = (cid: string) => `amar-talim-course-drafts-${cid}`;
const MAX_HISTORY = 50;
const DEBOUNCE_MS = 600;

export type SaveStatus = "idle" | "saving" | "saved";

export function useCourseBuilderHistory(courseId: string) {
  const {
    courses, topics, lessons, quizzes, assignments, quizQuestions,
    restoreCourseSnapshot,
  } = useAdmin();

  const slice = useMemo<CourseSnapshot | null>(() => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return null;
    return {
      course,
      topics: topics.filter((t) => t.courseId === courseId),
      lessons: lessons.filter((l) => l.courseId === courseId),
      quizzes: quizzes.filter((q) => q.courseId === courseId),
      assignments: assignments.filter((a) => a.courseId === courseId),
      quizQuestions: (() => {
        const ids = new Set([
          ...lessons.filter((l) => l.courseId === courseId).map((l) => l.id),
          ...quizzes.filter((q) => q.courseId === courseId).map((q) => q.id),
        ]);
        return quizQuestions.filter((q) => ids.has(q.lessonId));
      })(),
    };
  }, [courses, topics, lessons, quizzes, assignments, quizQuestions, courseId]);

  const historyRef = useRef<CourseSnapshot[]>([]);
  const indexRef = useRef(-1);
  const skipNextRef = useRef(false);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Seed history with first snapshot
  useEffect(() => {
    if (slice && historyRef.current.length === 0) {
      historyRef.current = [slice];
      indexRef.current = 0;
      rerender();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slice !== null]);

  // Debounced push to history on change
  const sliceKey = slice ? JSON.stringify(slice) : "";
  useEffect(() => {
    if (!slice) return;
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    const top = historyRef.current[indexRef.current];
    if (top && JSON.stringify(top) === sliceKey) return;
    setStatus("saving");
    const t = setTimeout(() => {
      const cut = historyRef.current.slice(0, indexRef.current + 1);
      const next = [...cut, slice].slice(-MAX_HISTORY);
      historyRef.current = next;
      indexRef.current = next.length - 1;
      setStatus("saved");
      setSavedAt(Date.now());
      rerender();
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [sliceKey, slice]);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    skipNextRef.current = true;
    restoreCourseSnapshot(courseId, historyRef.current[indexRef.current]);
    setStatus("saved");
    setSavedAt(Date.now());
    rerender();
  }, [courseId, restoreCourseSnapshot]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    skipNextRef.current = true;
    restoreCourseSnapshot(courseId, historyRef.current[indexRef.current]);
    setStatus("saved");
    setSavedAt(Date.now());
    rerender();
  }, [courseId, restoreCourseSnapshot]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // Drafts (persisted)
  const [drafts, setDrafts] = useState<DraftVersion[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(DRAFTS_KEY(courseId));
      return raw ? (JSON.parse(raw) as DraftVersion[]) : [];
    } catch { return []; }
  });
  const persistDrafts = (next: DraftVersion[]) => {
    setDrafts(next);
    try { localStorage.setItem(DRAFTS_KEY(courseId), JSON.stringify(next)); } catch { /* quota */ }
  };
  const saveDraft = (label?: string) => {
    if (!slice) return;
    const ts = Date.now();
    const v: DraftVersion = {
      id: String(ts) + Math.random().toString(36).slice(2, 6),
      label: label?.trim() || new Date(ts).toLocaleString("bn-BD"),
      ts, snap: slice,
    };
    persistDrafts([v, ...drafts].slice(0, 20));
    return v;
  };
  const restoreDraft = (id: string) => {
    const d = drafts.find((x) => x.id === id);
    if (!d) return;
    skipNextRef.current = true;
    restoreCourseSnapshot(courseId, d.snap);
    // Push restored state as new history entry
    setTimeout(() => {
      const cut = historyRef.current.slice(0, indexRef.current + 1);
      const next = [...cut, d.snap].slice(-MAX_HISTORY);
      historyRef.current = next;
      indexRef.current = next.length - 1;
      rerender();
    }, 0);
  };
  const deleteDraft = (id: string) => persistDrafts(drafts.filter((d) => d.id !== id));

  return {
    status, savedAt,
    canUndo, canRedo, undo, redo,
    drafts, saveDraft, restoreDraft, deleteDraft,
  };
}
