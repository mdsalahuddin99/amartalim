import type { Course as PrismaCourse, Lesson as PrismaLesson, Enrollment as PrismaEnrollment, Quiz as PrismaQuiz, Topic as PrismaTopic, CourseCategory as PrismaCategory, Assignment as PrismaAssignment, QuizQuestion as PrismaQuizQuestion } from "@prisma/client";

export interface Category extends PrismaCategory {
  description?: string | null;
  courseCount?: number;
  icon?: string;
  parentId?: string | null;
}

export interface Course extends PrismaCourse {
  categoryName?: string;
  duration?: string;
  lessonsCount?: number;
  studentsCount?: number;
  instructorName?: string;
  instructorBio?: string;
  level?: "শিক্ষানবিস" | "মধ্যবর্তী" | "উন্নত" | string;
  whatYouLearn?: string[];
  whoIsFor?: string[];
  problems?: { title: string; items: string[] }[];
  benefits?: string[];
  modules?: { title: string; description: string; lessons: string[]; duration: string }[];
  language?: string;
  accessType?: "public" | "password" | "paid" | string;
  password?: string;
  maxStudents?: number;
  enableDrip?: boolean;
  enableCertificate?: boolean;
  certificateTemplate?: string;
  prerequisites?: string[];
  isBundle?: boolean;
  bundleCourseIds?: string[];
  salePrice?: number | null;
  pricingType?: "free" | "one-time" | "subscription" | string;
  subscriptionInterval?: "monthly" | "yearly" | string;
}

export interface Topic extends Omit<PrismaTopic, 'summary'> {
  summary?: string | null;
}

export interface Assignment extends Omit<PrismaAssignment, 'instructions' | 'maxPoints' | 'dueDays' | 'order'> {
  instructions?: string | null;
  maxPoints?: number | null;
  dueDays?: number | null;
  attachments?: string[];
  order?: number;
}

export interface Lesson extends PrismaLesson {
  youtubeId?: string | null;
  contentType?: "video" | "text" | "live" | string;
  body?: string | null;
  attachments?: string[];
  isPreview?: boolean;
  dripDays?: number | null;
}

export interface QuizMeta extends PrismaQuiz {
  passingScore?: number | null;
  attempts?: number | null;
}

export interface QuizQuestion extends Omit<PrismaQuizQuestion, 'type' | 'options' | 'answers' | 'points' | 'order' | 'explanation'> {
  options?: string[];
  correctAnswer?: number;
  type?: "mcq" | "true-false" | "short" | "fill" | string;
  answers?: number[];
  points?: number;
  order?: number;
  explanation?: string | null;
}

export interface Enrollment extends PrismaEnrollment {
  progress?: number;
  completedLessons?: string[];
}

export interface Review {
  id: string;
  courseId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
