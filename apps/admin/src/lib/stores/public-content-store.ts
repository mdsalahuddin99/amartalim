"use client";
import { useEffect, useState } from "react";
import {
  categories as initCategories,
  courses as initCourses,
  lessons as initLessons,
  quizQuestions as initQuizQuestions,
} from "@/lib/seed/mock-data";
import type {
  Category,
  Course,
  Lesson,
  QuizQuestion,
  Topic,
  Assignment,
  QuizMeta,
} from "@/lib/seed/mock-data";

/**
 * Read-only snapshot of the admin content tree for public/learn pages.
 *
 * Reads from the same localStorage key the AdminProvider writes to
 * (`amar-talim-admin-store-v2`), so consumers do NOT need AdminProvider
 * mounted in the React tree. This lets public visitors avoid the heavy
 * write-capable context (and its rerenders).
 *
 * Updates propagate via:
 *  - native `storage` event (cross-tab)
 *  - custom `amartalim:admin-store:changed` event (same-tab, dispatched by AdminProvider)
 */

const LS_KEY = "amar-talim-admin-store-v2";
export const ADMIN_STORE_EVT = "amartalim:admin-store:changed";

export interface PublicContent {
  categories: Category[];
  courses: Course[];
  topics: Topic[];
  lessons: Lesson[];
  quizzes: QuizMeta[];
  assignments: Assignment[];
  quizQuestions: QuizQuestion[];
}

interface StoredState {
  categories?: Category[];
  courses?: Course[];
  topics?: Topic[];
  lessons?: Lesson[];
  quizzes?: QuizMeta[];
  assignments?: Assignment[];
  quizQuestions?: QuizQuestion[];
}

const fallback = (): PublicContent => ({
  categories: [...initCategories],
  courses: [...initCourses],
  topics: [],
  lessons: [...initLessons],
  quizzes: [],
  assignments: [],
  quizQuestions: [...initQuizQuestions],
});

const read = (): PublicContent => {
  const fb = fallback();
  if (typeof window === "undefined") return fb;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fb;
    const parsed = JSON.parse(raw) as StoredState;
    return {
      categories: parsed.categories ?? fb.categories,
      courses: parsed.courses ?? fb.courses,
      topics: parsed.topics ?? fb.topics,
      lessons: parsed.lessons ?? fb.lessons,
      quizzes: parsed.quizzes ?? fb.quizzes,
      assignments: parsed.assignments ?? fb.assignments,
      quizQuestions: parsed.quizQuestions ?? fb.quizQuestions,
    };
  } catch {
    return fb;
  }
};

// Shared snapshot — single read shared across all subscribers per tick.
let snapshot: PublicContent | null = null;
const listeners = new Set<() => void>();

const ensure = () => {
  if (!snapshot) snapshot = read();
  return snapshot;
};

const refresh = () => {
  snapshot = read();
  listeners.forEach((l) => l());
};

let wired = false;
const wire = () => {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener("storage", (e) => {
    if (e.key === LS_KEY) refresh();
  });
  window.addEventListener(ADMIN_STORE_EVT, refresh);
};

/** Dispatched by AdminProvider after each persist so public hooks rerender. */
export const notifyAdminStoreChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_STORE_EVT));
};

export function usePublicContent(): PublicContent {
  wire();
  const [state, setState] = useState<PublicContent>(() => ensure());
  useEffect(() => {
    const cb = () => setState(ensure());
    listeners.add(cb);
    // Always pull a fresh read on mount in case the store changed before subscribe.
    cb();
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return state;
}
