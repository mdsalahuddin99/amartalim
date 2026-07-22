"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminBlogCategories from "@/components/admin/AdminBlogCategories";
import { type BlogCategory } from "@prisma/client";

const Page = ({ initialCategories }: { initialCategories: BlogCategory[] }) => (
  <AdminLayout>
    <AdminBlogCategories initialCategories={initialCategories} />
  </AdminLayout>
);

export default Page;
