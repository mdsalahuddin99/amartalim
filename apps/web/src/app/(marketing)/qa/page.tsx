import { Suspense } from "react";
import { Link } from "@/lib/navigation";
import { getQaPosts } from "@/server/actions/qa.actions";
import { getQaCategories } from "@/server/actions/qa-category.actions";
import SharedNavbar from "@/components/shared/navbar";
import SharedFooter from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ChevronRight, PenTool } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "আপনার জিজ্ঞাসা - ইসলামিক প্রশ্নোত্তর | Amar Talim",
  description: "আপনার ইসলামিক প্রশ্ন করুন এবং মুফতি সাহেবদের কাছ থেকে শরয়ি সমাধান জানুন।",
};

export const revalidate = 60; // ISR cache 1 minute

export default async function QaHomepage() {
  const [resPosts, resCats] = await Promise.all([
    getQaPosts({ status: "PUBLISHED" }),
    getQaCategories()
  ]);

  const posts = resPosts.ok && resPosts.data ? resPosts.data : [];
  const categories = resCats.ok && resCats.data ? resCats.data : [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SharedNavbar />
      
      {/* Hero Section */}
      <div className="bg-primary/5 border-b py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20" variant="secondary">আপনার জিজ্ঞাসা</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif-bn text-foreground">ইসলামিক প্রশ্নোত্তর ও ফতোয়া</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            আপনার দৈনন্দিন জীবনের ইসলামিক সমস্যা ও জিজ্ঞাসাগুলোর নির্ভরযোগ্য শরয়ি সমাধান।
          </p>
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/qa/ask">
                <HelpCircle className="mr-2 h-5 w-5" /> প্রশ্ন করুন
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 bg-background">
              <Link href="/qa/muftis">
                <PenTool className="mr-2 h-5 w-5" /> মুফতি সাহেবগণ
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Main List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif-bn border-b pb-2 mb-6">সাম্প্রতিক ফতোয়া ও সমাধান</h2>
            
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-2xl bg-card">
                এখনও কোনো প্রশ্নোত্তর প্রকাশিত হয়নি।
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link key={post.id} href={`/qa/${post.slug}`} className="block group">
                    <Card className="p-6 transition-all hover:shadow-md border-border/50 hover:border-primary/30">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h3>
                          {post.questionDetails && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {post.questionDetails}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-medium">
                            {post.category && (
                              <Badge variant="secondary" className="font-normal rounded-md">{post.category.name}</Badge>
                            )}
                            {post.mufti && (
                              <span className="text-primary/80">উত্তরদাতা: {post.mufti.name}</span>
                            )}
                            <span className="text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString("bn-BD")}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center">
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <div className="bg-card rounded-2xl border p-5">
              <h3 className="font-bold text-lg mb-4">ক্যাটাগরি</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">কোনো ক্যাটাগরি নেই।</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {categories.filter(c => !c.parentId).map(c => (
                    <Link key={c.id} href={`/qa?cat=${c.slug}`} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5 flex justify-between items-center group">
                      <span>{c.name}</span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Ask Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6 text-center">
              <HelpCircle className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">আপনার কোনো জিজ্ঞাসা আছে?</h3>
              <p className="text-sm text-muted-foreground mb-5">আমাদের বিজ্ঞ মুফতি সাহেবদের কাছে আপনার ইসলামিক প্রশ্ন পাঠাতে পারেন।</p>
              <Button asChild className="w-full rounded-xl">
                <Link href="/qa/ask">প্রশ্ন করুন</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
}
