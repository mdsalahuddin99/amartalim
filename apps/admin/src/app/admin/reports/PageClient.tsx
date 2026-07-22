"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminReports from "@/components/admin/AdminReports";

const Page = ({ data }: { data: any }) => <AdminLayout><AdminReports data={data} /></AdminLayout>;
export default Page;
