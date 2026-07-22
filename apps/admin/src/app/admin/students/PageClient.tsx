"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminStudents, { StudentRow } from "@/components/admin/AdminStudents";

const Page = ({ initialStudents }: { initialStudents: StudentRow[] }) => (
  <AdminLayout>
    <AdminStudents initialStudents={initialStudents} />
  </AdminLayout>
);
export default Page;
