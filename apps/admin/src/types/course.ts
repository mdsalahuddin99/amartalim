export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  price: number;
  published: boolean;
  instructorId: string;
  categoryId?: string | null;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  videoId?: string | null;
  duration?: number | null;
  order: number;
  isFreePreview: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date | string;
  paymentId?: string | null;
}
