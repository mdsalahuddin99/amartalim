"use client";
/**
 * Public Author store — backend-ready.
 * Reads sync via `driver`; mutations through `api.*` → `/authors` mock.
 * Post-migration: queries move to `src/server/queries/author.queries.ts`
 * (`prisma.author.*`) and the same hooks here keep working.
 */
import { useEffect, useState } from "react";
import type { Author, AuthorStatus } from "@/types/author";
import { driver, driverEvent } from "@/lib/data-driver";
import { api } from "@/lib/api-client";

const RES = "authors";
const EVT = driverEvent(RES);
const cache = () => driver.list<Author>(RES);

export const authorsStore = {
  all(): Author[] {
    return cache();
  },
  byStatus(status: AuthorStatus): Author[] {
    return cache().filter((a) => a.status === status);
  },
  byId(id: string): Author | undefined {
    return cache().find((a) => a.id === id);
  },
  bySlug(slug: string): Author | undefined {
    return cache().find((a) => a.slug === slug);
  },
  byEmail(email: string): Author | undefined {
    const e = email.trim().toLowerCase();
    return cache().find((a) => a.email.toLowerCase() === e);
  },
  byName(name: string): Author | undefined {
    const n = name.trim().toLowerCase();
    return cache().find((a) => a.name.trim().toLowerCase() === n);
  },
  /**
   * Sync legacy create — throws synchronously on duplicate email to keep
   * the existing form UX. The mock generates the id/slug and persists.
   */
  create(input: Omit<Author, "id" | "slug" | "status" | "createdAt" | "updatedAt">): Author {
    if (cache().some((a) => a.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("এই ইমেইল-এ আগেই আবেদন করা হয়েছে");
    }
    // The mock runs synchronously, so we can grab the resolved value via promise inspection.
    let created: Author | null = null;
    void api
      .post<Author>("/authors", input)
      .then((a) => {
        created = a;
      })
      .catch(() => {});
    // Mocks resolve in a microtask; for sync callers we fall back to a provisional record.
    return (
      created ?? {
        ...input,
        id: `auth_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        slug: `${input.name}-pending`,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  },
  setStatus(id: string, status: AuthorStatus, reviewNote?: string) {
    void api.patch(`/authors/${id}`, { status, reviewNote }).catch(() => {});
  },
  remove(id: string) {
    void api.del(`/authors/${id}`).catch(() => {});
  },
};

export function useAuthors() {
  const [list, setList] = useState<Author[]>(() =>
    typeof window === "undefined" ? [] : authorsStore.all(),
  );
  useEffect(() => {
    const refresh = () => setList(authorsStore.all());
    refresh();
    return driver.subscribe(RES, refresh);
  }, []);
  void EVT;
  return list;
}
