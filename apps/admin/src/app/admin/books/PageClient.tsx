"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminBooks from "@/components/admin/AdminBooks";

export default function PageClient({ initialBooks, categories }: { initialBooks: any[], categories: any[] }) {
  return (
    <AdminLayout>
      <AdminBooks initialBooks={initialBooks} categories={categories} />
    </AdminLayout>
  );
}
