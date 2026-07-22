"use client";
import { useEffect, useState } from "react";
import type { Author, AuthorStatus } from "@/types/author";
import { applyAsAuthor, approveAuthor, rejectAuthor, suspendAuthor, deleteAuthorAdmin, getAllAuthorsAction } from "@/server/actions/author.actions";

export const authorsStore = {
  all(): Author[] {
    return [];
  },
  byStatus(status: AuthorStatus): Author[] {
    return [];
  },
  byId(id: string): Author | undefined {
    return undefined;
  },
  bySlug(slug: string): Author | undefined {
    return undefined;
  },
  byEmail(email: string): Author | undefined {
    return undefined;
  },
  byName(name: string): Author | undefined {
    return undefined;
  },
  create(input: Omit<Author, "id" | "slug" | "status" | "createdAt" | "updatedAt">): Author {
    void applyAsAuthor(input);
    return {
      ...input,
      id: `auth_${Date.now()}`,
      slug: `${input.name}-pending`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Author;
  },
  setStatus(id: string, status: AuthorStatus, reviewNote?: string) {
    if (status === "APPROVED") void approveAuthor(id);
    else if (status === "REJECTED") void rejectAuthor(id, { reviewNote: reviewNote || "No reason" });
    else if (status === "SUSPENDED") void suspendAuthor(id);
  },
  remove(id: string) {
    void deleteAuthorAdmin(id);
  },
};

export function useAuthors() {
  const [list, setList] = useState<Author[]>([]);
  useEffect(() => {
    getAllAuthorsAction().then((res) => {
      if (Array.isArray(res)) setList(res as unknown as Author[]);
    });
  }, []);
  return list;
}
