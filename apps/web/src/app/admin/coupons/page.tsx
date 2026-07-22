import { Metadata } from "next";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = { title: "কুপন ম্যানেজার | Admin" };

export default function Page() {
  return (
    <AdminLayout>
      <AdminCoupons />
    </AdminLayout>
  );
}
