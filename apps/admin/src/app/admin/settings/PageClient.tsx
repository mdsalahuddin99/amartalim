"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminSettings from "@/components/admin/AdminSettings";

const Page = ({ settings }: { settings: any }) => <AdminLayout><AdminSettings settings={settings} /></AdminLayout>;
export default Page;
