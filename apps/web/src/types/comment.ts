/**
 * Blog comment model — mirrors the future Prisma `Comment` table.
 * Nested replies are derived at runtime by linking `parentId` → `id`.
 */
export interface Comment {
  id: string;
  blogId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  body: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt?: string | null;
}

export interface CommentNode extends Comment {
  children: CommentNode[];
}
