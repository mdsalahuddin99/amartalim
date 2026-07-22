"use client";
import { useEffect, useState } from "react";
import type { Comment, CommentNode } from "@/types/comment";
import { api } from "@/lib/api-client";
import { driver, driverEvent } from "@/lib/data-driver";

/**
 * Client-side comment store — backend-ready.
 *
 * Reads sync via `driver`; mutations through `api.*` → `/comments` mock.
 * Post-migration: replace mock with real `prisma.comment.*` queries.
 */
const RES = "comments";
const EVT = driverEvent(RES);
const cache = () => driver.list<Comment>(RES);

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
  getThread(blogId: string): CommentNode[] {
    return buildTree(cache().filter((c) => c.blogId === blogId && !c.deletedAt));
  },
  getAll(): Comment[] {
    return cache();
  },
  count(blogId: string): number {
    return cache().filter((c) => c.blogId === blogId && !c.deletedAt).length;
  },
  async create(input: Omit<Comment, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<Comment> {
    return api.post<Comment>("/comments", input);
  },
  async softDelete(id: string, requesterId: string): Promise<void> {
    await api.del(`/comments/${id}`, { requesterId });
  },
  async adminDelete(id: string): Promise<void> {
    await api.del(`/comments/${id}`, { admin: "1" });
  },
  async restore(id: string): Promise<void> {
    await api.post(`/comments/${id}/restore`, {});
  },
};

export function useAllComments() {
  const [list, setList] = useState<Comment[]>(() => commentStore.getAll());
  useEffect(() => {
    const refresh = () => setList(commentStore.getAll());
    refresh();
    return driver.subscribe(RES, refresh);
  }, []);
  void EVT;
  return list;
}

export function useBlogComments(blogId: string) {
  const [thread, setThread] = useState<CommentNode[]>(() => commentStore.getThread(blogId));
  useEffect(() => {
    const refresh = () => setThread(commentStore.getThread(blogId));
    refresh();
    return driver.subscribe(RES, refresh);
  }, [blogId]);
  void EVT;
  return thread;
}
