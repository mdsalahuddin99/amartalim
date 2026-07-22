"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminCategories from "@/components/admin/AdminCategories";

const Page = ({ initialCategories }: { initialCategories: any[] }) => (
  <AdminLayout>
    <AdminCategories initialCategories={initialCategories} />
  </AdminLayout>
);
export default Page;
