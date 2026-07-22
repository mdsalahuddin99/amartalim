import { Metadata } from "next";
import { AdminQaCategoriesWrapper } from "@/components/admin/AdminContentWrappers";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "জিজ্ঞাসা ক্যাটাগরি | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminQaCategoriesWrapper />
    </AdminLayout>
  );
}
