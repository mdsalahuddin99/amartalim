import { notFound } from "next/navigation";
import { Link } from "@/lib/navigation";
import SharedNavbar from "@/components/shared/navbar";
import { getMuftis } from "@/server/actions/mufti.actions";
import { getQaPosts } from "@/server/actions/qa.actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const res = await getMuftis();
  const mufti = res.ok && res.data ? res.data.find(m => m.slug === params.slug) : null;
  if (!mufti) return { title: "Not Found" };
  return { title: `মুফতি ${mufti.name} - আপনার জিজ্ঞাসা | Amar Talim` };
}

export default async function MuftiProfilePage({ params }: { params: { slug: string } }) {
  const res = await getMuftis();
  const mufti = res.ok && res.data ? res.data.find(m => m.slug === params.slug) : null;
  if (!mufti) return notFound();

  // Fetch posts answered by this mufti
  // In a real app we'd add an option to filter by muftiId directly in getQaPosts
  // But since getQaPosts returns all (or by status), we can filter here for now
  const postsRes = await getQaPosts({ status: "PUBLISHED" });
  const posts = postsRes.ok && postsRes.data ? postsRes.data.filter(p => p.muftiId === mufti.id) : [];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <SharedNavbar />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
        <div className="bg-card rounded-3xl p-8 border shadow-sm mb-12 flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
          <Avatar className="h-32 w-32 border-4 border-background shadow-md">
            {mufti.avatar ? <AvatarImage src={mufti.avatar} /> : null}
            <AvatarFallback className="text-4xl">{mufti.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-3xl font-bold font-serif-bn">{mufti.name}</h1>
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            {mufti.shortBio && <p className="text-lg text-muted-foreground">{mufti.shortBio}</p>}
            
            {mufti.expertise.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <span className="text-sm font-semibold text-muted-foreground mr-1">দক্ষতা:</span>
                {mufti.expertise.map(exp => (
                  <Badge key={exp} variant="secondary">{exp}</Badge>
                ))}
              </div>
            )}

            <div className="pt-4 text-foreground/80 leading-relaxed max-w-3xl whitespace-pre-wrap text-sm sm:text-base">
              {mufti.bio}
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          <h2 className="text-2xl font-bold font-serif-bn border-b pb-2 mb-6">উত্তরিত ফতোয়া ও জিজ্ঞাসাসমূহ ({posts.length})</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-2xl bg-card">
              এখনও কোনো ফতোয়া প্রকাশিত হয়নি।
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
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-medium">
                          {post.category && (
                            <Badge variant="secondary" className="font-normal rounded-md">{post.category.name}</Badge>
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
      </main>
    </div>
  );
}
