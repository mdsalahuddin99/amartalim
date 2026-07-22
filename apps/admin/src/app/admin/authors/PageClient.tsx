"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminAuthors from "@/components/admin/AdminAuthors";
import type { Author } from "@prisma/client";

const Page = ({ authors }: { authors: Author[] }) => (
  <AdminLayout>
    <AdminAuthors initialAuthors={authors} />
  </AdminLayout>
);
export default Page;
