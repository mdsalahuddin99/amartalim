"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminOrders from "@/components/admin/AdminOrders";

const Page = ({ initialOrders }: { initialOrders: any[] }) => <AdminLayout><AdminOrders initialOrders={initialOrders} /></AdminLayout>;
export default Page;
