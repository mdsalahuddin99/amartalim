import { Metadata } from "next";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "সেটিংস | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminSettings />
    </AdminLayout>
  );
}
