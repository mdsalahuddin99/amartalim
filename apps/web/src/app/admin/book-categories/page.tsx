import { Metadata } from "next";
import { AdminBookCategoriesWrapper } from "@/components/admin/AdminContentWrappers";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "বইয়ের ক্যাটাগরি | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminBookCategoriesWrapper />
    </AdminLayout>
  );
}
