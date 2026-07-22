import { Metadata } from "next";
import { AdminBlogsWrapper } from "@/components/admin/AdminContentWrappers";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "ব্লগ ব্যবস্থাপনা | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminBlogsWrapper />
    </AdminLayout>
  );
}
