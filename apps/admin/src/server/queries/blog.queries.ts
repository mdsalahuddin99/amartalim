import { prisma } from "../db/prisma";
import type { ManagedBlogPost, ManagedBlogCategory } from "@/types/blog";

/**
 * Blog query layer fetching from Prisma Database.
 */
export const getPublishedBlogs = async (opts: { take?: number; skip?: number } = {}): Promise<ManagedBlogPost[]> => {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    include: {
      authorProfile: true,
      category: true,
    },
    take: opts.take,
    skip: opts.skip,
  });

  return blogs.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || "",
    content: blog.content,
    cover: blog.coverImage || "",
    categoryId: blog.categoryId || "all",
    categoryName: blog.category?.name || "Uncategorized",
    author: blog.authorProfile?.name || "Unknown Author",
    authorProfileId: blog.authorProfileId || undefined,
    authorProfileSlug: blog.authorProfile?.slug,
    authorBio: blog.authorProfile?.shortBio || blog.authorProfile?.bio || "",
    date: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
    readTime: blog.readingTime || 5,
    featured: (blog as any).featured || false,
    tags: blog.tags,
    faq: (blog as any).faq ? (typeof (blog as any).faq === "string" ? JSON.parse((blog as any).faq) : (blog as any).faq) : undefined,
    showToc: (blog as any).showToc !== false,
    status: "published",
    updatedAt: blog.updatedAt.toISOString(),
  }));
};

export const getBlogBySlug = async (slug: string): Promise<ManagedBlogPost | null> => {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      authorProfile: true,
      category: true,
    },
  });

  if (!blog) return null;

  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || "",
    content: blog.content,
    cover: blog.coverImage || "",
    categoryId: blog.categoryId || "all",
    categoryName: blog.category?.name || "Uncategorized",
    author: blog.authorProfile?.name || "Unknown Author",
    authorProfileId: blog.authorProfileId || undefined,
    authorProfileSlug: blog.authorProfile?.slug,
    authorBio: blog.authorProfile?.shortBio || blog.authorProfile?.bio || "",
    date: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
    readTime: blog.readingTime || 5,
    featured: (blog as any).featured || false,
    tags: blog.tags,
    faq: (blog as any).faq ? (typeof (blog as any).faq === "string" ? JSON.parse((blog as any).faq) : (blog as any).faq) : undefined,
    showToc: (blog as any).showToc !== false,
    status: blog.published ? "published" : "draft",
    updatedAt: blog.updatedAt.toISOString(),
  };
};

export const getAllBlogsForAdmin = async (): Promise<ManagedBlogPost[]> => {
  const blogs = await prisma.blog.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      authorProfile: true,
      category: true,
    },
  });

  return blogs.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || "",
    content: blog.content,
    cover: blog.coverImage || "",
    categoryId: blog.categoryId || "all",
    categoryName: blog.category?.name || "Uncategorized",
    author: blog.authorProfile?.name || "Unknown Author",
    authorProfileId: blog.authorProfileId || undefined,
    authorProfileSlug: blog.authorProfile?.slug,
    authorBio: blog.authorProfile?.shortBio || blog.authorProfile?.bio || "",
    date: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
    readTime: blog.readingTime || 5,
    featured: false,
    tags: blog.tags,
    status: blog.published ? "published" : "draft",
    updatedAt: blog.updatedAt.toISOString(),
  }));
};

export const getBlogCategories = async (): Promise<ManagedBlogCategory[]> => {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { createdAt: "asc" }
  });

  return categories.map((cat) => ({
    id: cat.slug,
    name: cat.name,
    slug: cat.slug,
    description: "",
    color: "#2C6E49",
    parentId: null,
  }));
};

export const getBlogsByTag = async (tag: string): Promise<ManagedBlogPost[]> => {
  const blogs = await prisma.blog.findMany({
    where: {
      published: true,
      tags: { has: tag },
      deletedAt: null,
    },
    orderBy: { publishedAt: "desc" },
    include: { authorProfile: true, category: true },
  });

  return blogs.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || "",
    content: blog.content,
    cover: blog.coverImage || "",
    categoryId: blog.categoryId || "all",
    categoryName: blog.category?.name || "Uncategorized",
    author: blog.authorProfile?.name || "Unknown Author",
    authorProfileId: blog.authorProfileId || undefined,
    authorProfileSlug: blog.authorProfile?.slug,
    authorBio: blog.authorProfile?.shortBio || blog.authorProfile?.bio || "",
    date: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
    readTime: blog.readingTime || 5,
    featured: false,
    tags: blog.tags,
    status: "published" as const,
    updatedAt: blog.updatedAt.toISOString(),
  }));
};

