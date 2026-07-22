"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminInstructors from "@/components/admin/AdminInstructors";

const Page = ({ initialInstructors }: { initialInstructors: any[] }) => (
  <AdminLayout>
    <AdminInstructors initialInstructors={initialInstructors} />
  </AdminLayout>
);
export default Page;
