import { prisma } from "../db/prisma";
import type { AuthorPublic, ManagedBlogPost } from "@/types/blog";
import type { Author } from "@prisma/client";

export const getAuthorBySlug = async (slug: string): Promise<AuthorPublic | null> => {
  const author = await prisma.author.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { blogs: { where: { published: true } } }
      }
    }
  });

  if (!author) return null;

  return {
    slug: author.slug,
    name: author.name,
    bio: author.bio,
    shortBio: author.shortBio,
    avatar: author.avatar,
    totalPosts: author._count.blogs,
  };
};

export const getAuthorPosts = async (slug: string): Promise<ManagedBlogPost[]> => {
  const blogs = await prisma.blog.findMany({
    where: {
      published: true,
      authorProfile: { slug }
    },
    include: {
      authorProfile: true,
      category: true,
    },
    orderBy: { publishedAt: "desc" }
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
    authorBio: blog.authorProfile?.shortBio || blog.authorProfile?.bio || "",
    date: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
    readTime: blog.readingTime || 5,
    featured: false,
    tags: blog.tags,
    status: "published",
    updatedAt: blog.updatedAt.toISOString(),
  }));
};

export const getAllAuthorsForAdmin = async (): Promise<Author[]> => {
  return await prisma.author.findMany({
    orderBy: { createdAt: "desc" }
  });
};
