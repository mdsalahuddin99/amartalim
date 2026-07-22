"use client";

import { useEffect, useState } from "react";
import AdminBlogs from "@/components/admin/AdminBlogs";
import AdminBlogCategories from "@/components/admin/AdminBlogCategories";
import AdminBooks from "@/components/admin/AdminBooks";
import AdminBookCategories from "@/components/admin/AdminBookCategories";
import AdminQaPosts from "@/components/admin/AdminQaPosts";
import AdminQaCategories from "@/components/admin/AdminQaCategories";
import { Loader2 } from "lucide-react";

const Loading = () => (
  <div className="flex items-center justify-center py-20 text-muted-foreground">
    <Loader2 className="h-6 w-6 animate-spin mr-2" />
    <span>লোড হচ্ছে...</span>
  </div>
);

// ─── Blog Wrapper ─────────────────────────────────────────────────────
export const AdminBlogsWrapper = () => {
  const [posts, setPosts] = useState<any[] | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      import("@/server/actions/admin-content.actions").then(m => m.getAdminBlogs()),
      import("@/server/actions/admin-content.actions").then(m => m.getAdminBlogCategories()),
      import("@/server/actions/admin-content.actions").then(m => m.getAdminAuthors()),
    ]).then(([blogs, cats, auths]) => {
      setPosts(blogs);
      setCategories(cats);
      setAuthors(auths);
    }).catch(console.error);
  }, []);

  if (posts === null) return <Loading />;
  return <AdminBlogs initialPosts={posts as any} initialCategories={categories as any} authors={authors as any} />;
};

// ─── Blog Categories Wrapper ──────────────────────────────────────────
export const AdminBlogCategoriesWrapper = () => {
  const [categories, setCategories] = useState<any[] | null>(null);

  useEffect(() => {
    import("@/server/actions/admin-content.actions")
      .then(m => m.getAdminBlogCategories())
      .then(setCategories)
      .catch(console.error);
  }, []);

  if (categories === null) return <Loading />;
  return <AdminBlogCategories initialCategories={categories as any} />;
};

// ─── Books Wrapper ────────────────────────────────────────────────────
export const AdminBooksWrapper = () => {
  const [books, setBooks] = useState<any[] | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      import("@/server/actions/admin-content.actions").then(m => m.getAdminBooks()),
      import("@/server/actions/admin-content.actions").then(m => m.getAdminBookCategories()),
    ]).then(([b, c]) => {
      setBooks(b);
      setCategories(c);
    }).catch(console.error);
  }, []);

  if (books === null) return <Loading />;
  return <AdminBooks initialBooks={books as any} categories={categories as any} />;
};

// ─── Book Categories Wrapper ──────────────────────────────────────────
export const AdminBookCategoriesWrapper = () => {
  const [categories, setCategories] = useState<any[] | null>(null);

  useEffect(() => {
    import("@/server/actions/admin-content.actions")
      .then(m => m.getAdminBookCategories())
      .then(setCategories)
      .catch(console.error);
  }, []);

  if (categories === null) return <Loading />;
  return <AdminBookCategories initialCategories={categories as any} />;
};

// ─── QA Posts Wrapper ────────────────────────────────────────────────
export const AdminQaPostsWrapper = () => {
  const [posts, setPosts] = useState<any[] | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [muftis, setMuftis] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      import("@/server/actions/admin-content.actions").then(m => m.getAdminQaPosts()),
      import("@/server/actions/admin-content.actions").then(m => m.getAdminQaCategories()),
      import("@/server/actions/admin-content.actions").then(m => m.getAdminMuftis()),
    ]).then(([p, c, m]) => {
      setPosts(p);
      setCategories(c);
      setMuftis(m);
    }).catch(console.error);
  }, []);

  if (posts === null) return <Loading />;
  return <AdminQaPosts initialPosts={posts} categories={categories as any} muftis={muftis as any} />;
};

// ─── QA Categories Wrapper ────────────────────────────────────────────
export const AdminQaCategoriesWrapper = () => {
  const [categories, setCategories] = useState<any[] | null>(null);

  useEffect(() => {
    import("@/server/actions/admin-content.actions")
      .then(m => m.getAdminQaCategories())
      .then(setCategories)
      .catch(console.error);
  }, []);

  if (categories === null) return <Loading />;
  return <AdminQaCategories initialCategories={categories as any} />;
};
