import { Metadata } from "next";
import AdminAds from "@/components/admin/AdminAds";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "বিজ্ঞাপন ম্যানেজার | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminAds />
    </AdminLayout>
  );
}
