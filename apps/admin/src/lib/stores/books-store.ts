"use client";
import { useEffect, useState } from "react";
import { driver } from "@/lib/data-driver";
import { api } from "@/lib/api-client";
import { seedBooks } from "@/lib/seed/books-data";
import type { BookRecord } from "@/types/book";

const RES = "books";

const ensureSeed = (): BookRecord[] => {
  const list = driver.list<BookRecord>(RES);
  if (list.length === 0 && typeof window !== "undefined") {
    driver.save(RES, seedBooks);
    return seedBooks;
  }
  return list;
};

export const booksStore = {
  getAll(): BookRecord[] {
    return ensureSeed();
  },
  getPublished(): BookRecord[] {
    return booksStore.getAll().filter((b) => (b.status ?? "published") === "published");
  },
  get(id: string): BookRecord | undefined {
    return booksStore.getAll().find((b) => b.id === id);
  },
  create(input: Partial<BookRecord> & { title: string; author: string }): BookRecord {
    const now = new Date().toISOString();
    const book: BookRecord = {
      id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      title: input.title,
      author: input.author,
      cover: input.cover || "/placeholder.svg",
      category: input.category || "ই-বুক",
      subcategory: input.subcategory || "অন্যান্য",
      description: input.description || "",
      pages: input.pages ?? 0,
      rating: input.rating ?? 0,
      readers: input.readers ?? 0,
      publishDate: input.publishDate || new Date().getFullYear().toString(),
      language: input.language || "বাংলা",
      isFree: input.isFree ?? true,
      status: input.status || "published",
      chapters: input.chapters || [],
      createdAt: now,
      updatedAt: now,
    };
    void api.post("/books", book).catch(() => {});
    return book;
  },
  update(id: string, patch: Partial<BookRecord>) {
    void api.patch(`/books/${id}`, patch).catch(() => {});
  },
  remove(id: string) {
    void api.del(`/books/${id}`).catch(() => {});
  },
};

export function useBooks() {
  const [books, setBooks] = useState<BookRecord[]>(() =>
    typeof window === "undefined" ? seedBooks : booksStore.getAll(),
  );
  useEffect(() => {
    const refresh = () => setBooks(booksStore.getAll());
    refresh();
    return driver.subscribe(RES, refresh);
  }, []);
  return books;
}

export function usePublishedBooks() {
  return useBooks().filter((b) => (b.status ?? "published") === "published");
}

export function useBook(id?: string) {
  const all = useBooks();
  return id ? all.find((b) => b.id === id) : undefined;
}
