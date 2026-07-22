import type { Lesson, QuizMeta, Assignment } from "@/types/course";

export type ItemKind = "lesson" | "quiz" | "assignment";
export type Item =
  | { kind: "lesson"; data: Lesson }
  | { kind: "quiz"; data: QuizMeta }
  | { kind: "assignment"; data: Assignment };

export const itemId = (kind: ItemKind, id: string) => `${kind}:${id}`;
export const parseItemId = (s: string) => {
  const [kind, ...rest] = s.split(":");
  return { kind: kind as ItemKind, id: rest.join(":") };
};
