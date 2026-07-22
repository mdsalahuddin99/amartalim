"use server";

import type { BlogCreateInput, BlogUpdateInput } from "@/lib/validators/blog";
import { blogCreateSchema, blogUpdateSchema } from "@/lib/validators/blog";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}



export const createBlog = async (input: BlogCreateInput): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
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
    
    // Validate if the category exists in DB (as we no longer use mock data)
    if (d.categoryId) {
      let dbCat = await prisma.blogCategory.findUnique({ where: { id: d.categoryId } });
      if (!dbCat) {
        if (d.categoryName) {
           dbCat = await prisma.blogCategory.create({
              data: {
                name: d.categoryName,
                slug: d.categoryId,
              }
           });
        } else {
           return { ok: false, error: "ক্যাটাগরি ডাটাবেসে পাওয়া যায়নি।" };
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
        featured: d.featured ?? false,
        showToc: d.showToc ?? true,
        faq: d.faq ? JSON.stringify(d.faq) : null,
        authorProfileId: d.authorProfileId,
        hasAuthorProfile: !!d.authorProfileId,
        authorId: session.user.id, // Linking to User model (system author)
        published: d.published,
        publishedAt: d.publishAt ? new Date(d.publishAt) : (d.published ? new Date() : null),
      },
    });
    return { ok: true, data: { id: blog.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error creating blog" };
  }
};

export const updateBlog = async (id: string, input: BlogUpdateInput): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
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
              data: {
                name: d.categoryName,
                slug: d.categoryId,
              }
           });
        } else {
           return { ok: false, error: "ক্যাটাগরি ডাটাবেসে পাওয়া যায়নি।" };
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
        ...(d.featured !== undefined && { featured: d.featured }),
        ...(d.showToc !== undefined && { showToc: d.showToc }),
        faq: d.faq !== undefined ? (d.faq ? JSON.stringify(d.faq) : null) : undefined,
        authorProfileId: d.authorProfileId !== undefined ? d.authorProfileId : undefined,
        hasAuthorProfile: d.authorProfileId !== undefined ? !!d.authorProfileId : undefined,
        ...(d.published !== undefined && { 
          published: d.published,
          publishedAt: d.published ? new Date() : null 
        }),
        ...(d.publishAt && { publishedAt: new Date(d.publishAt) })
      },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating blog" };
  }
};

export const deleteBlog = async (id: string): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
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
