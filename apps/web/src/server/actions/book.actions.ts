"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { ActionResult } from "./blog.actions";
import { slugify } from "@/types/blog";

export const getBooks = async () => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        chapters: {
          orderBy: { orderIndex: "asc" }
        }
      }
    });
    return { ok: true, data: books };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error fetching books" };
  }
};

export const getBook = async (id: string) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        chapters: {
          orderBy: { orderIndex: "asc" }
        }
      }
    });
    if (!book) return { ok: false, error: "Book not found" };
    return { ok: true, data: book };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error fetching book" };
  }
};

export const createBook = async (input: any): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const { chapters, ...bookData } = input;
    
    // Convert publishDate to string if it's not
    const publishDate = bookData.publishDate ? String(bookData.publishDate) : undefined;
    
    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        slug: slugify(bookData.title) + "-" + Date.now().toString().slice(-4),
        author: bookData.author,
        cover: bookData.cover || null,
        description: bookData.description || null,
        pages: Number(bookData.pages) || 0,
        rating: Number(bookData.rating) || 0,
        readers: Number(bookData.readers) || 0,
        publishDate: publishDate,
        language: bookData.language || "বাংলা",
        isFree: Boolean(bookData.isFree),
        status: bookData.status || "published",
        categoryId: bookData.category || null,
        subcategory: bookData.subcategory || null,
        
        chapters: {
          create: (chapters || []).map((ch: any, i: number) => ({
            title: ch.title,
            content: ch.content,
            image: ch.image || null,
            orderIndex: i
          }))
        }
      },
    });
    return { ok: true, data: { id: book.id } };
  } catch (err) {
    console.error("Create Book Error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Error creating book" };
  }
};

export const updateBook = async (id: string, patch: any): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const { chapters, category, subcategory, ...bookData } = patch;
    
    const dataToUpdate: any = { ...bookData };
    
    if (patch.title) {
      // we could update slug but usually better not to break links, so we'll keep it as is
    }
    
    if (category !== undefined) dataToUpdate.categoryId = category || null;
    if (subcategory !== undefined) dataToUpdate.subcategory = subcategory || null;
    
    // To update chapters, it's easiest to delete all and recreate, or update existing.
    // For simplicity in this mock-to-dynamic transition, we delete and recreate.
    if (chapters) {
      await prisma.bookChapter.deleteMany({ where: { bookId: id } });
      dataToUpdate.chapters = {
        create: chapters.map((ch: any, i: number) => ({
          title: ch.title,
          content: ch.content,
          image: ch.image || null,
          orderIndex: i
        }))
      };
    }

    await prisma.book.update({
      where: { id },
      data: dataToUpdate,
    });
    return { ok: true };
  } catch (err) {
    console.error("Update Book Error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Error updating book" };
  }
};

export const deleteBook = async (id: string): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    await prisma.book.delete({
      where: { id },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting book" };
  }
};
