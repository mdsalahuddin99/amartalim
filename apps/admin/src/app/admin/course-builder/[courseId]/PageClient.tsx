"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import CourseBuilder from "@/components/admin/CourseBuilder";

const Page = ({ initialCourse, categories }: { initialCourse: any; categories: any[] }) => {
  return (
    <AdminLayout>
      <CourseBuilder initialCourse={initialCourse} categories={categories} backHref="/admin/courses" />
    </AdminLayout>
  );
};
export default Page;
