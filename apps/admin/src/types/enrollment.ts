/**
 * Enrollment — represents a paid/free access grant to a course.
 *
 * Today persists via mock `/enrollments` → localStorage. After Next.js
 * migration this maps 1:1 to Prisma's `Enrollment` model.
 */
export interface EnrollmentRecord {
  id: string;
  userId: string;
  courseId: string;
  orderId?: string | null;
  source: "PAID" | "FREE" | "ADMIN";
  enrolledAt: string;
}
