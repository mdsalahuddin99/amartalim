"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getAdminCourses, getAdminAllData, updateAdminCourse, deleteAdminCourse, createAdminCourse,
  getCourseTopics, createTopic, updateTopic as updateTopicDb, deleteTopic as deleteTopicDb, reorderTopics as reorderTopicsDb,
  getCourseLessons, createLesson, updateLesson as updateLessonDb, deleteLesson as deleteLessonDb,
  getCourseQuizzes, createQuiz, updateQuiz as updateQuizDb, deleteQuiz as deleteQuizDb,
  getCourseAssignments, createAssignment, updateAssignment as updateAssignmentDb, deleteAssignment as deleteAssignmentDb,
  reorderTopicItemsAction, getQuizQuestions, createQuizQuestion, updateQuizQuestion as updateQuizQuestionDb, deleteQuizQuestion as deleteQuizQuestionDb
} from "@/server/actions/admin-course.actions";
import { toast } from "sonner";

// Types
export interface Category { id: string; name: string; slug: string; description?: string; parentId?: string | null; icon?: any; courseCount?: number; }
export interface Course { id: string; title: string; published: boolean; [key: string]: any; }
export interface Topic { id: string; courseId: string; title: string; summary?: string; order: number; }
export interface Lesson { id: string; courseId: string; topicId?: string; title: string; order: number; [key: string]: any; }
export interface QuizMeta { id: string; courseId: string; topicId?: string; title: string; order: number; [key: string]: any; }
export interface Assignment { id: string; courseId: string; topicId: string; title: string; order: number; [key: string]: any; }
import type { QuizQuestion } from "@/types/course";

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
  addCourse: (course: Omit<Course, "id">) => Promise<string>;
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
  // Quizzes
  addQuiz: (quiz: Omit<QuizMeta, "id">) => string;
  updateQuiz: (id: string, quiz: Partial<QuizMeta>) => void;
  deleteQuiz: (id: string) => void;
  // Assignments
  addAssignment: (a: Omit<Assignment, "id">) => string;
  updateAssignment: (id: string, a: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  // Reorder items
  reorderTopicItems: (topicId: string, items: { id: string; kind: "lesson" | "quiz" | "assignment" }[]) => void;
  moveItem: (id: string, kind: "lesson" | "quiz" | "assignment", targetTopicId: string, newOrder: number) => void;
  // Quiz Questions
  addQuizQuestion: (q: Omit<QuizQuestion, "id">) => void;
  updateQuizQuestion: (id: string, q: Partial<QuizQuestion>) => void;
  deleteQuizQuestion: (id: string) => void;
  restoreCourseSnapshot: (courseId: string, snap: any) => void;
  ensureDefaultTopic: (courseId: string) => string;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

import { useSession } from "next-auth/react";

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (session?.user && (session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR")) {
      getAdminAllData()
        .then(data => {
          setCourses(data.courses as any);
          setTopics(data.topics as any);
          setLessons(data.lessons as any);
          setQuizzes(data.quizzes as any);
          setAssignments(data.assignments as any);
          setQuizQuestions(data.quizQuestions as any);
          setCategories(data.categories as any);
        })
        .catch(err => console.error("Failed to load admin data:", err));
    }
  }, [session?.user?.role]);

  // Debounced persistence removed since we use db

  // Categories
  const addCategory = (cat: Omit<Category, "id">) => setCategories((p) => [...p, { ...cat, id: uid() }]);
  const updateCategory = (id: string, data: Partial<Category>) => setCategories((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)));
  const deleteCategory = (id: string) => setCategories((p) => p.filter((c) => c.id !== id));

  // Courses
  const addCourse = async (course: Omit<Course, "id">) => {
    // Generate a temporary ID for optimistic UI
    const tempId = uid();
    setCourses((p) => [...p, { ...course, id: tempId } as Course]);
    
    // Call real DB
    try {
      const newCourse = await createAdminCourse(course);
      setCourses((p) => p.map(c => c.id === tempId ? { ...c, id: newCourse.id } : c));
      return newCourse.id;
    } catch (error) {
      console.error("Failed to create course", error);
      toast.error("কোর্স তৈরি করতে সমস্যা হয়েছে");
      // Revert optimistic update
      setCourses((p) => p.filter(c => c.id !== tempId));
      return tempId; // Return tempId to avoid crashing, though it's invalid
    }
  };
  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)));
    void updateAdminCourse(id, data);
  };
  const deleteCourse = (id: string) => {
    setCourses((p) => p.filter((c) => c.id !== id));
    void deleteAdminCourse(id);
  };

  // Topics
  const addTopic = (topic: Omit<Topic, "id">) => {
    const id = uid();
    setTopics((p) => [...p, { ...topic, id }]);
    void createTopic({ ...topic, courseId: topic.courseId, title: topic.title, order: topic.order }).then(res => {
      setTopics(p => p.map(t => t.id === id ? { ...t, id: res.id } : t));
    });
    return id;
  };
  const updateTopic = (id: string, data: Partial<Topic>) => {
    setTopics((p) => p.map((t) => (t.id === id ? { ...t, ...data } : t)));
    void updateTopicDb(id, data);
  };
  const deleteTopic = (id: string) => {
    setTopics((p) => p.filter((t) => t.id !== id));
    void deleteTopicDb(id);
  };
  const reorderTopics = (courseId: string, orderedIds: string[]) => {
    setTopics((p) => p.map((t) => {
      if (t.courseId !== courseId) return t;
      const idx = orderedIds.indexOf(t.id);
      return idx >= 0 ? { ...t, order: idx + 1 } : t;
    }));
    void reorderTopicsDb(courseId, orderedIds);
  };

  // Lessons
  const addLesson = (lesson: Omit<Lesson, "id">) => {
    const id = uid();
    setLessons((p) => [...p, { ...lesson, id } as Lesson]);
    void createLesson(lesson as any).then(res => {
      setLessons(p => p.map(l => l.id === id ? { ...l, id: res.id } : l));
    });
    return id;
  };
  const updateLesson = (id: string, data: Partial<Lesson>) => {
    setLessons((p) => p.map((l) => (l.id === id ? { ...l, ...data } : l)));
    void updateLessonDb(id, data);
  };
  const deleteLesson = (id: string) => {
    setLessons((p) => p.filter((l) => l.id !== id));
    void deleteLessonDb(id);
  };

  // Quizzes
  const addQuiz = (quiz: Omit<QuizMeta, "id">) => {
    const id = uid();
    setQuizzes((p) => [...p, { ...quiz, id } as QuizMeta]);
    void createQuiz(quiz as any).then(res => {
      setQuizzes(p => p.map(q => q.id === id ? { ...q, id: res.id } : q));
    });
    return id;
  };
  const updateQuiz = (id: string, data: Partial<QuizMeta>) => {
    setQuizzes((p) => p.map((q) => (q.id === id ? { ...q, ...data } : q)));
    void updateQuizDb(id, data);
  };
  const deleteQuiz = (id: string) => {
    setQuizzes((p) => p.filter((q) => q.id !== id));
    void deleteQuizDb(id);
  };

  // Assignments
  const addAssignment = (a: Omit<Assignment, "id">) => {
    const id = uid();
    setAssignments((p) => [...p, { ...a, id } as Assignment]);
    void createAssignment(a as any).then(res => {
      setAssignments(p => p.map(ax => ax.id === id ? { ...ax, id: res.id } : ax));
    });
    return id;
  };
  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    setAssignments((p) => p.map((a) => (a.id === id ? { ...a, ...data } : a)));
    void updateAssignmentDb(id, data);
  };
  const deleteAssignment = (id: string) => {
    setAssignments((p) => p.filter((a) => a.id !== id));
    void deleteAssignmentDb(id);
  };

  const reorderTopicItems = (topicId: string, items: { id: string; kind: "lesson" | "quiz" | "assignment" }[]) => {
    items.forEach((it, i) => {
      const order = i + 1;
      if (it.kind === "lesson") setLessons((p) => p.map((l) => (l.id === it.id ? { ...l, order, topicId } : l)));
      else if (it.kind === "quiz") setQuizzes((p) => p.map((q) => (q.id === it.id ? { ...q, order, topicId } : q)));
      else setAssignments((p) => p.map((a) => (a.id === it.id ? { ...a, order, topicId } : a)));
    });
    void reorderTopicItemsAction(topicId, items);
  };

  const moveItem = (id: string, kind: "lesson" | "quiz" | "assignment", targetTopicId: string, newOrder: number) => {
    if (kind === "lesson") setLessons((p) => p.map((l) => (l.id === id ? { ...l, topicId: targetTopicId, order: newOrder } : l)));
    else if (kind === "quiz") setQuizzes((p) => p.map((q) => (q.id === id ? { ...q, topicId: targetTopicId, order: newOrder } : q)));
    else setAssignments((p) => p.map((a) => (a.id === id ? { ...a, topicId: targetTopicId, order: newOrder } : a)));
    // Implement move DB if needed
  };

  // Quiz Questions
  const addQuizQuestion = (q: Omit<QuizQuestion, "id">) => {
    const id = uid();
    setQuizQuestions((p) => [...p, { ...q, id } as QuizQuestion]);
    void createQuizQuestion(q).then(res => {
      setQuizQuestions(p => p.map(qx => qx.id === id ? { ...qx, id: res.id } : qx));
    });
  };
  const updateQuizQuestion = (id: string, data: Partial<QuizQuestion>) => {
    setQuizQuestions((p) => p.map((q) => (q.id === id ? { ...q, ...data } : q)));
    void updateQuizQuestionDb(id, data);
  };
  const deleteQuizQuestion = (id: string) => {
    setQuizQuestions((p) => p.filter((q) => q.id !== id));
    void deleteQuizQuestionDb(id);
  };

  const restoreCourseSnapshot: AdminContextType["restoreCourseSnapshot"] = (cid, snap) => {
    setCourses((p) => p.map((c) => (c.id === cid ? snap.course : c)));
    setTopics((p) => [...p.filter((t) => t.courseId !== cid), ...snap.topics]);
    setLessons((p) => [...p.filter((l) => l.courseId !== cid), ...snap.lessons]);
    setQuizzes((p) => [...p.filter((q) => q.courseId !== cid), ...snap.quizzes]);
    setAssignments((p) => [...p.filter((a) => a.courseId !== cid), ...snap.assignments]);
    const ownedIds = new Set([...snap.lessons.map((l) => l.id), ...snap.quizzes.map((q) => q.id)]);
    setQuizQuestions((p) => [...p.filter((q) => !ownedIds.has(q.quizId)), ...snap.quizQuestions]);
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
