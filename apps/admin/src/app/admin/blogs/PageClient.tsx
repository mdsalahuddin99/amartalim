"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminBlogs from "@/components/admin/AdminBlogs";
import type { ManagedBlogPost } from "@/types/blog";
import { type BlogCategory, type Author } from "@prisma/client";

const Page = ({ blogs, categories, authors }: { blogs: ManagedBlogPost[], categories: BlogCategory[], authors: Author[] }) => (
  <AdminLayout>
    <AdminBlogs initialPosts={blogs} initialCategories={categories} authors={authors} />
  </AdminLayout>
);
export default Page;
