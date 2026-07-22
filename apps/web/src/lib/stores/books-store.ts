"use client";
import { useEffect, useState } from "react";
import type { BookRecord } from "@/types/book";
import { createBook, updateBook, deleteBook, getBooks } from "@/server/actions/book.actions";

export const booksStore = {
  getAll(): BookRecord[] {
    return [];
  },
  getPublished(): BookRecord[] {
    return [];
  },
  get(id: string): BookRecord | undefined {
    return undefined;
  },
  create(input: Partial<BookRecord> & { title: string; author: string }): BookRecord {
    const now = new Date().toISOString();
    const book: BookRecord = {
      id: `bk_${Date.now()}`,
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
    void createBook(book);
    return book;
  },
  update(id: string, patch: Partial<BookRecord>) {
    void updateBook(id, patch);
  },
  remove(id: string) {
    void deleteBook(id);
  },
};

export function useBooks() {
  const [books, setBooks] = useState<BookRecord[]>([]);
  useEffect(() => {
    getBooks().then(res => {
      if (res.ok && Array.isArray(res.data)) {
        const mapped = res.data.map((b: any) => ({
          ...b,
          createdAt: b.createdAt?.toISOString(),
          updatedAt: b.updatedAt?.toISOString()
        } as BookRecord));
        setBooks(mapped);
      }
    });
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
