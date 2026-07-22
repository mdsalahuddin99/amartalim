"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminOverview from "@/components/admin/AdminOverview";

const AdminDashboardPage = ({ stats, activity }: { stats: any, activity: any }) => (
  <AdminLayout>
    <AdminOverview stats={stats} activity={activity} />
  </AdminLayout>
);

export default AdminDashboardPage;
