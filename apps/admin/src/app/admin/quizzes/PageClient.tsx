"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminQuizzes from "@/components/admin/AdminQuizzes";

const Page = (props: any) => <AdminLayout><AdminQuizzes {...props} /></AdminLayout>;
export default Page;
