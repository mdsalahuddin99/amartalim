import { getQaPosts } from "@/server/actions/qa.actions";
import { getQaCategories } from "@/server/actions/qa-category.actions";
import { getMuftis } from "@/server/actions/mufti.actions";
import AdminQaPosts from "@/components/admin/AdminQaPosts";

export const metadata = {
  title: "Admin - QA Posts | Amar Talim",
};

export default async function QaPostsPage() {
  const [resPosts, resCats, resMuftis] = await Promise.all([
    getQaPosts(),
    getQaCategories(),
    getMuftis()
  ]);

  const posts = resPosts.ok && resPosts.data ? resPosts.data : [];
  const categories = resCats.ok && resCats.data ? resCats.data : [];
  const muftis = resMuftis.ok && resMuftis.data ? resMuftis.data : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AdminQaPosts 
        initialPosts={posts} 
        categories={categories} 
        muftis={muftis} 
      />
    </div>
  );
}
