import { Metadata } from "next";
import { AdminBooksWrapper } from "@/components/admin/AdminContentWrappers";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "লাইব্রেরি বই | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminBooksWrapper />
    </AdminLayout>
  );
}
