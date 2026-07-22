import { Metadata } from "next";
import { AdminBlogCategoriesWrapper } from "@/components/admin/AdminContentWrappers";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "ব্লগ ক্যাটাগরি | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminBlogCategoriesWrapper />
    </AdminLayout>
  );
}
