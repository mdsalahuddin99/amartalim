"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminCourses from "@/components/admin/AdminCourses";

const Page = ({ initialCourses, initialCategories }: { initialCourses: any[], initialCategories: any[] }) => (
  <AdminLayout>
    <AdminCourses initialCourses={initialCourses} initialCategories={initialCategories} />
  </AdminLayout>
);
export default Page;
