"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminBookCategories from "@/components/admin/AdminBookCategories";

export default function PageClient({ initialCategories }: { initialCategories: any[] }) {
  return (
    <AdminLayout>
      <AdminBookCategories initialCategories={initialCategories} />
    </AdminLayout>
  );
}
