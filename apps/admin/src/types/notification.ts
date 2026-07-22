export type NotificationKind =
  | "order_paid"
  | "course_enrolled"
  | "lesson_completed"
  | "quiz_passed"
  | "quiz_failed"
  | "certificate_ready"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  message: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
}
