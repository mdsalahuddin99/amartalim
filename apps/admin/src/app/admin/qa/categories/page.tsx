import { getQaCategories } from "@/server/actions/qa-category.actions";
import AdminQaCategories from "@/components/admin/AdminQaCategories";

export const metadata = {
  title: "Admin - QA Categories | Amar Talim",
};

export default async function QaCategoriesPage() {
  const res = await getQaCategories();
  const categories = res.ok && res.data ? res.data : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminQaCategories initialCategories={categories} />
    </div>
  );
}
