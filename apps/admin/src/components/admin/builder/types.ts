export type ItemKind = "lesson" | "quiz" | "assignment";
export type Item =
  | { kind: "lesson"; data: any }
  | { kind: "quiz"; data: any }
  | { kind: "assignment"; data: any };

export const itemId = (kind: ItemKind, id: string) => `${kind}:${id}`;
export const parseItemId = (s: string) => {
  const [kind, ...rest] = s.split(":");
  return { kind: kind as ItemKind, id: rest.join(":") };
};
