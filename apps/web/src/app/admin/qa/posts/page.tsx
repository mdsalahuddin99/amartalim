import { Metadata } from "next";
import { AdminQaPostsWrapper } from "@/components/admin/AdminContentWrappers";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "আপনার জিজ্ঞাসা (QA) | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminQaPostsWrapper />
    </AdminLayout>
  );
}
