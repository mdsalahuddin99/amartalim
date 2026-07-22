"use server";

import type { BlogCreateInput, BlogUpdateInput } from "@/lib/validators/blog";
import { blogCreateSchema, blogUpdateSchema } from "@/lib/validators/blog";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { ActionResult } from "./blog.actions";

export const createUserBlog = async (input: BlogCreateInput): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  // Check if the user is an approved author
  const authorProfile = await prisma.author.findUnique({
    where: { email: session.user.email! }
  });

  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    if (!authorProfile || authorProfile.status !== "APPROVED") {
      return { ok: false, error: "Only approved authors can create blogs." };
    }
  }

  const parsed = blogCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const d = parsed.data;
    let finalCategoryId = d.categoryId;
    
    if (d.categoryId) {
      let dbCat = await prisma.blogCategory.findUnique({ where: { id: d.categoryId } });
      if (!dbCat) {
        if (d.categoryName) {
           dbCat = await prisma.blogCategory.create({
              data: { name: d.categoryName, slug: d.categoryId }
           });
        } else {
           return { ok: false, error: "Category not found." };
        }
      }
      finalCategoryId = dbCat.id;
    }

    const blog = await prisma.blog.create({
      data: {
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt ?? null,
        content: d.content,
        categoryId: finalCategoryId,
        coverImage: d.cover ?? null,
        tags: d.tags,
        featured: false, // Users cannot feature their own blogs
        showToc: d.showToc ?? true,
        faq: d.faq ? JSON.stringify(d.faq) : null,
        authorProfileId: authorProfile?.id,
        hasAuthorProfile: !!authorProfile?.id,
        authorId: session.user.id,
        published: false, // Needs admin approval
        publishedAt: null,
        status: (d.published || d.status === "pending") ? "pending" : "draft",
      },
    });
    return { ok: true, data: { id: blog.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error creating blog" };
  }
};

export const updateUserBlog = async (id: string, input: BlogUpdateInput): Promise<ActionResult> => {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog || blog.authorId !== session.user.id) {
    return { ok: false, error: "Not found or not your blog" };
  }

  const parsed = blogUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Validation failed" };
  }

  try {
    const d = parsed.data;
    let finalCategoryId = d.categoryId;

    if (d.categoryId) {
      let dbCat = await prisma.blogCategory.findUnique({ where: { id: d.categoryId } });
      if (!dbCat) {
        if (d.categoryName) {
           dbCat = await prisma.blogCategory.create({
              data: { name: d.categoryName, slug: d.categoryId }
           });
        } else {
           return { ok: false, error: "Category not found." };
        }
      }
      finalCategoryId = dbCat.id;
    }

    await prisma.blog.update({
      where: { id },
      data: {
        ...(d.title && { title: d.title }),
        ...(d.slug && { slug: d.slug }),
        ...(d.excerpt !== undefined && { excerpt: d.excerpt ?? null }),
        ...(d.content && { content: d.content }),
        ...(finalCategoryId && { categoryId: finalCategoryId }),
        ...(d.cover !== undefined && { coverImage: d.cover ?? null }),
        ...(d.tags && { tags: d.tags }),
        ...(d.showToc !== undefined && { showToc: d.showToc }),
        faq: d.faq !== undefined ? (d.faq ? JSON.stringify(d.faq) : null) : undefined,
        // Users cannot publish directly, edits require re-approval
        published: false,
        publishedAt: null,
        status: (d.published || d.status === "pending") ? "pending" : "draft",
      },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating blog" };
  }
};

export const deleteUserBlog = async (id: string): Promise<ActionResult> => {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog || blog.authorId !== session.user.id) {
    return { ok: false, error: "Not found or not your blog" };
  }

  try {
    await prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting blog" };
  }
};

export const getUserBlogsAction = async () => {
  const session = await auth();
  if (!session?.user) return [];

  const blogs = await prisma.blog.findMany({
    where: { 
      deletedAt: null,
      authorId: session.user.id 
    },
    include: {
      category: true,
      author: true,
      authorProfile: true
    },
    orderBy: { createdAt: "desc" }
  });

  return blogs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt || "",
    content: b.content,
    cover: b.coverImage || "/placeholder.svg",
    categoryId: b.categoryId || "arabic",
    categoryName: b.category?.name || "Uncategorized",
    author: b.authorProfile?.name || b.author?.name || "Amar Talim",
    authorBio: b.authorProfile?.bio || "",
    date: b.publishedAt?.toISOString() || b.createdAt.toISOString(),
    readTime: b.readingTime || Math.max(2, Math.ceil(b.content.length / 1200)),
    featured: b.featured,
    tags: b.tags,
    faq: b.faq ? JSON.parse(b.faq as string) : [],
    status: (b.published ? "published" : b.status) as "published" | "draft" | "scheduled" | "pending",
    publishAt: b.publishedAt?.toISOString(),
    updatedAt: b.updatedAt.toISOString()
  }));
};
