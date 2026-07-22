import SharedNavbar from "@/components/shared/navbar";
import QaAskClient from "./QaAskClient";
import { getQaCategories } from "@/server/actions/qa-category.actions";

export const metadata = {
  title: "প্রশ্ন করুন - আপনার জিজ্ঞাসা | Amar Talim",
};

export default async function QaAskPage() {
  const resCats = await getQaCategories();
  const categories = resCats.ok && resCats.data ? resCats.data : [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SharedNavbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8 text-center space-y-3">
          <h1 className="text-3xl font-bold font-serif-bn">আপনার জিজ্ঞাসা জমা দিন</h1>
          <p className="text-muted-foreground">
            আপনার দৈনন্দিন জীবনের যেকোনো ইসলামিক মাসয়ালা বা জিজ্ঞাসা বিস্তারিত লিখে জমা দিন। আমাদের বিজ্ঞ মুফতি সাহেবগণ দ্রুত এর শরয়ি সমাধান দেওয়ার চেষ্টা করবেন ইনশাআল্লাহ।
          </p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border p-6 sm:p-8">
          <QaAskClient categories={categories} />
        </div>
      </div>
    </div>
  );
}
