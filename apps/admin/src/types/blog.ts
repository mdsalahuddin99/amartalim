export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  published: boolean;
  publishedAt?: Date | string | null;
  views: number;
  readingTime?: number | null;
  authorId: string;
  categoryId?: string | null;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export type BlogStatus = "draft" | "scheduled" | "published";

export interface ManagedBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  categoryId: string;
  categoryName: string;
  authorProfileId?: string;
  authorProfileSlug?: string;
  authorBio?: string;
  date: string;
  readTime: number;
  featured: boolean;
  tags: string[];
  faq?: { q: string; a: string }[];
  status: BlogStatus;
  publishAt?: string;
  updatedAt: string;
  showToc?: boolean;
}

export interface ManagedBlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  parentId?: string | null;
}

export interface AuthorPublic {
  slug: string;
  name: string;
  bio: string;
  shortBio?: string | null;
  avatar?: string | null;
  totalPosts: number;
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^\u0980-\u09FF\u0600-\u06FFa-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
