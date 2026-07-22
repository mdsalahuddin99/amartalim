"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

const isAdmin = async () => {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    throw new Error("Unauthorized");
  }
  return session.user;
};

// ─── Blogs ──────────────────────────────────────────────────────────
export async function getAdminBlogs() {
  await isAdmin();
  const blogs = await prisma.blog.findMany({
    where: { deletedAt: null },
    include: { category: true, authorProfile: true, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return blogs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt || "",
    content: b.content,
    cover: b.coverImage || "/placeholder.svg",
    categoryId: b.categoryId || "",
    categoryName: b.category?.name || "",
    author: b.authorProfile?.name || b.author?.name || "Unknown",
    authorProfileId: b.authorProfileId || "",
    authorBio: b.authorProfile?.bio || "",
    date: b.publishedAt?.toISOString() || b.createdAt.toISOString(),
    readTime: b.readingTime || Math.max(2, Math.ceil(b.content.length / 1200)),
    featured: b.featured,
    tags: b.tags,
    faq: b.faq ? JSON.parse(b.faq as string) : [],
    status: (b.published ? "published" : b.status) as "published" | "draft" | "scheduled" | "pending",
    publishAt: b.publishedAt?.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));
}

export async function getAdminBlogCategories() {
  await isAdmin();
  return prisma.blogCategory.findMany({ orderBy: { createdAt: "asc" } });
}

// ─── Authors ─────────────────────────────────────────────────────────
export async function getAdminAuthors() {
  await isAdmin();
  return prisma.author.findMany({ orderBy: { createdAt: "desc" } });
}

// ─── Books ───────────────────────────────────────────────────────────
export async function getAdminBooks() {
  await isAdmin();
  return prisma.book.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      chapters: { orderBy: { orderIndex: "asc" } },
    },
  });
}

export async function getAdminBookCategories() {
  await isAdmin();
  return prisma.bookCategory.findMany({ orderBy: { createdAt: "asc" } });
}

// ─── QA ──────────────────────────────────────────────────────────────
export async function getAdminQaPosts() {
  await isAdmin();
  const posts = await prisma.qaPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      mufti: true,
      asker: { select: { name: true, image: true } },
    },
  });
  return posts.map((p) => ({
    ...p,
    tags: p.tags || [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() || null,
  }));
}

export async function getAdminQaCategories() {
  await isAdmin();
  return prisma.qaCategory.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getAdminMuftis() {
  await isAdmin();
  return prisma.mufti.findMany({ orderBy: { createdAt: "desc" } });
}
