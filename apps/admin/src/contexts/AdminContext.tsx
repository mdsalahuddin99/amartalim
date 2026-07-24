"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  categories as initCategories,
  courses as initCourses,
  lessons as initLessons,
  quizQuestions as initQuizQuestions,
} from "@/lib/seed/mock-data";
import type { Category, Course, Lesson, QuizQuestion, Topic, Assignment, QuizMeta } from "@/lib/seed/mock-data";
import { notifyAdminStoreChanged } from "@/lib/stores/public-content-store";

interface AdminContextType {
  categories: Category[];
  courses: Course[];
  topics: Topic[];
  lessons: Lesson[];
  quizzes: QuizMeta[];
  assignments: Assignment[];
  quizQuestions: QuizQuestion[];
  // Categories
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Courses
  addCourse: (course: Omit<Course, "id">) => string;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  // Topics
  addTopic: (topic: Omit<Topic, "id">) => string;
  updateTopic: (id: string, topic: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  reorderTopics: (courseId: string, orderedIds: string[]) => void;
  // Lessons
  addLesson: (lesson: Omit<Lesson, "id">) => string;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  // Quizzes (containers)
  addQuiz: (quiz: Omit<QuizMeta, "id">) => string;
  updateQuiz: (id: string, quiz: Partial<QuizMeta>) => void;
  deleteQuiz: (id: string) => void;
  // Assignments
  addAssignment: (a: Omit<Assignment, "id">) => string;
  updateAssignment: (id: string, a: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  // Reorder items within topic
  reorderTopicItems: (topicId: string, items: { id: string; kind: "lesson" | "quiz" | "assignment" }[]) => void;
  // Move item across topics
  moveItem: (id: string, kind: "lesson" | "quiz" | "assignment", targetTopicId: string, newOrder: number) => void;
  // Quiz Questions
  addQuizQuestion: (q: Omit<QuizQuestion, "id">) => void;
  updateQuizQuestion: (id: string, q: Partial<QuizQuestion>) => void;
  // Snapshot restore (for undo/redo + draft versions)
  restoreCourseSnapshot: (courseId: string, snap: {
    course: Course; topics: Topic[]; lessons: Lesson[];
    quizzes: QuizMeta[]; assignments: Assignment[]; quizQuestions: QuizQuestion[];
  }) => void;
  deleteQuizQuestion: (id: string) => void;
  // Helper — ensure default topic exists for course; returns its id
  ensureDefaultTopic: (courseId: string) => string;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

const LS_KEY = "amar-talim-admin-store-v2";

interface StoredState {
  categories: Category[];
  courses: Course[];
  topics: Topic[];
  lessons: Lesson[];
  quizzes: QuizMeta[];
  assignments: Assignment[];
  quizQuestions: QuizQuestion[];
}

function loadInitial<T>(key: keyof StoredState, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const v = parsed[key];
    return (v ?? fallback) as T;
  } catch { return fallback; }
}

const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>(() => loadInitial("categories", [...initCategories]));
  const [courses, setCourses] = useState<Course[]>(() => loadInitial("courses", [...initCourses]));
  const [topics, setTopics] = useState<Topic[]>(() => loadInitial("topics", []));
  const [lessons, setLessons] = useState<Lesson[]>(() => loadInitial("lessons", [...initLessons]));
  const [quizzes, setQuizzes] = useState<QuizMeta[]>(() => loadInitial("quizzes", []));
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadInitial("assignments", []));
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => loadInitial("quizQuestions", [...initQuizQuestions]));

  // Debounced persistence — avoids JSON.stringify of the entire admin tree
  // on every keystroke. Saves 800ms after the last change.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ categories, courses, topics, lessons, quizzes, assignments, quizQuestions }),
        );
        notifyAdminStoreChanged();
      } catch (err) {
        console.error("[AdminContext] persist failed", err);
      }
    }, 800);
    return () => window.clearTimeout(handle);
  }, [categories, courses, topics, lessons, quizzes, assignments, quizQuestions]);

  // Final flush on unmount/tab close so in-flight edits are not lost.
  useEffect(() => {
    const flush = () => {
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ categories, courses, topics, lessons, quizzes, assignments, quizQuestions }),
        );
      } catch { /* quota */ }
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [categories, courses, topics, lessons, quizzes, assignments, quizQuestions]);

  // Categories
  const addCategory = (cat: Omit<Category, "id">) => setCategories((p) => [...p, { ...cat, id: uid() } as Category]);
  const updateCategory = (id: string, data: Partial<Category>) =>
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)));
  const deleteCategory = (id: string) => setCategories((p) => p.filter((c) => c.id !== id));

  // Courses
  const addCourse = (course: Omit<Course, "id">) => {
    const id = uid();
    setCourses((p) => [...p, { ...course, id }]);
    return id;
  };
  const updateCourse = (id: string, data: Partial<Course>) =>
    setCourses((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)));
  const deleteCourse = (id: string) => {
    setCourses((p) => p.filter((c) => c.id !== id));
    setTopics((p) => p.filter((t) => t.courseId !== id));
    setLessons((p) => p.filter((l) => l.courseId !== id));
    setQuizzes((p) => p.filter((q) => q.courseId !== id));
    setAssignments((p) => p.filter((a) => a.courseId !== id));
  };

  // Topics
  const addTopic = (topic: Omit<Topic, "id">) => {
    const id = uid();
    setTopics((p) => [...p, { ...topic, id }]);
    return id;
  };
  const updateTopic = (id: string, data: Partial<Topic>) =>
    setTopics((p) => p.map((t) => (t.id === id ? { ...t, ...data } : t)));
  const deleteTopic = (id: string) => {
    setTopics((p) => p.filter((t) => t.id !== id));
    setLessons((p) => p.filter((l) => l.topicId !== id));
    setQuizzes((p) => p.filter((q) => q.topicId !== id));
    setAssignments((p) => p.filter((a) => a.topicId !== id));
  };
  const reorderTopics = (courseId: string, orderedIds: string[]) => {
    setTopics((p) => p.map((t) => {
      if (t.courseId !== courseId) return t;
      const idx = orderedIds.indexOf(t.id);
      return idx >= 0 ? { ...t, order: idx + 1 } : t;
    }));
  };

  // Lessons
  const addLesson = (lesson: Omit<Lesson, "id">) => {
    const id = uid();
    setLessons((p) => [...p, { ...lesson, id }]);
    return id;
  };
  const updateLesson = (id: string, data: Partial<Lesson>) =>
    setLessons((p) => p.map((l) => (l.id === id ? { ...l, ...data } : l)));
  const deleteLesson = (id: string) => {
    setLessons((p) => p.filter((l) => l.id !== id));
    setQuizQuestions((p) => p.filter((q) => q.lessonId !== id));
  };

  // Quizzes
  const addQuiz = (quiz: Omit<QuizMeta, "id">) => {
    const id = uid();
    setQuizzes((p) => [...p, { ...quiz, id }]);
    return id;
  };
  const updateQuiz = (id: string, data: Partial<QuizMeta>) =>
    setQuizzes((p) => p.map((q) => (q.id === id ? { ...q, ...data } : q)));
  const deleteQuiz = (id: string) => {
    setQuizzes((p) => p.filter((q) => q.id !== id));
    setQuizQuestions((p) => p.filter((q) => q.lessonId !== id));
  };

  // Assignments
  const addAssignment = (a: Omit<Assignment, "id">) => {
    const id = uid();
    setAssignments((p) => [...p, { ...a, id }]);
    return id;
  };
  const updateAssignment = (id: string, data: Partial<Assignment>) =>
    setAssignments((p) => p.map((a) => (a.id === id ? { ...a, ...data } : a)));
  const deleteAssignment = (id: string) => setAssignments((p) => p.filter((a) => a.id !== id));

  const reorderTopicItems = (topicId: string, items: { id: string; kind: "lesson" | "quiz" | "assignment" }[]) => {
    items.forEach((it, i) => {
      const order = i + 1;
      if (it.kind === "lesson") setLessons((p) => p.map((l) => (l.id === it.id ? { ...l, order, topicId } : l)));
      else if (it.kind === "quiz") setQuizzes((p) => p.map((q) => (q.id === it.id ? { ...q, order, topicId } : q)));
      else setAssignments((p) => p.map((a) => (a.id === it.id ? { ...a, order, topicId } : a)));
    });
  };

  const moveItem = (id: string, kind: "lesson" | "quiz" | "assignment", targetTopicId: string, newOrder: number) => {
    if (kind === "lesson") setLessons((p) => p.map((l) => (l.id === id ? { ...l, topicId: targetTopicId, order: newOrder } : l)));
    else if (kind === "quiz") setQuizzes((p) => p.map((q) => (q.id === id ? { ...q, topicId: targetTopicId, order: newOrder } : q)));
    else setAssignments((p) => p.map((a) => (a.id === id ? { ...a, topicId: targetTopicId, order: newOrder } : a)));
  };

  // Quiz Questions
  const addQuizQuestion = (q: Omit<QuizQuestion, "id">) => setQuizQuestions((p) => [...p, { ...q, id: uid() }]);
  const updateQuizQuestion = (id: string, data: Partial<QuizQuestion>) =>
    setQuizQuestions((p) => p.map((q) => (q.id === id ? { ...q, ...data } : q)));
  const deleteQuizQuestion = (id: string) => setQuizQuestions((p) => p.filter((q) => q.id !== id));

  const restoreCourseSnapshot: AdminContextType["restoreCourseSnapshot"] = (cid, snap) => {
    setCourses((p) => p.map((c) => (c.id === cid ? snap.course : c)));
    setTopics((p) => [...p.filter((t) => t.courseId !== cid), ...snap.topics]);
    setLessons((p) => [...p.filter((l) => l.courseId !== cid), ...snap.lessons]);
    setQuizzes((p) => [...p.filter((q) => q.courseId !== cid), ...snap.quizzes]);
    setAssignments((p) => [...p.filter((a) => a.courseId !== cid), ...snap.assignments]);
    const ownedIds = new Set([...snap.lessons.map((l) => l.id), ...snap.quizzes.map((q) => q.id)]);
    setQuizQuestions((p) => [...p.filter((q) => !ownedIds.has(q.lessonId)), ...snap.quizQuestions]);
  };

  const ensureDefaultTopic = (courseId: string): string => {
    const existing = topics.find((t) => t.courseId === courseId);
    if (existing) return existing.id;
    const id = uid();
    const newTopic: Topic = { id, courseId, title: "মূল পাঠ্যসূচি", order: 1 };
    setTopics((p) => [...p, newTopic]);
    // Migrate existing lessons without topicId
    setLessons((p) => p.map((l) => (l.courseId === courseId && !l.topicId ? { ...l, topicId: id } : l)));
    return id;
  };

  return (
    <AdminContext.Provider
      value={{
        categories, courses, topics, lessons, quizzes, assignments, quizQuestions,
        addCategory, updateCategory, deleteCategory,
        addCourse, updateCourse, deleteCourse,
        addTopic, updateTopic, deleteTopic, reorderTopics,
        addLesson, updateLesson, deleteLesson,
        addQuiz, updateQuiz, deleteQuiz,
        addAssignment, updateAssignment, deleteAssignment,
        reorderTopicItems, moveItem,
        addQuizQuestion, updateQuizQuestion, deleteQuizQuestion,
        restoreCourseSnapshot,
        ensureDefaultTopic,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
