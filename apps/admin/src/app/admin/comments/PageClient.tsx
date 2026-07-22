"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminComments from "@/components/admin/AdminComments";

const Page = ({ comments }: { comments: any[] }) => (
  <AdminLayout>
    <AdminComments initialComments={comments} />
  </AdminLayout>
);
export default Page;
