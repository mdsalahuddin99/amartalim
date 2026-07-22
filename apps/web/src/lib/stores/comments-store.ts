"use client";
import { useEffect, useState } from "react";
import type { Comment, CommentNode } from "@/types/comment";
import { createComment, deleteComment, approveComment, getBlogCommentsAction, getAllCommentsAction } from "@/server/actions/comment.actions";

const buildTree = (flat: Comment[]): CommentNode[] => {
  const map = new Map<string, CommentNode>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CommentNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortRec = (nodes: CommentNode[]) => {
    nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
};

export const commentStore = {
  async create(input: Omit<Comment, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<Comment | null> {
    const res = await createComment(input);
    if (res.ok) {
      return { ...input, id: res.data.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Comment;
    }
    return null;
  },
  async softDelete(id: string, requesterId: string): Promise<void> {
    await deleteComment(id);
  },
  async adminDelete(id: string): Promise<void> {
    await deleteComment(id);
  },
  async restore(id: string): Promise<void> {
    // Implement if needed
  },
};

export function useAllComments() {
  const [list, setList] = useState<Comment[]>([]);
  useEffect(() => {
    getAllCommentsAction().then(res => setList(res as Comment[]));
  }, []);
  return list;
}

export function useBlogComments(blogId: string) {
  const [thread, setThread] = useState<CommentNode[]>([]);
  useEffect(() => {
    getBlogCommentsAction(blogId).then(res => setThread(buildTree(res as Comment[])));
  }, [blogId]);
  return thread;
}
