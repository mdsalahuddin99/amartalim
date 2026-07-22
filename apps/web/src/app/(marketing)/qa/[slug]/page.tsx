import { notFound } from "next/navigation";
import { Link } from "@/lib/navigation";
import SharedNavbar from "@/components/shared/navbar";
import { getQaPostBySlug, recordQaView } from "@/server/actions/qa.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronLeft, Calendar, User, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const res = await getQaPostBySlug(params.slug);
  if (!res.ok || !res.data) return { title: "Not Found" };
  const post = res.data;
  const title = `${post.title} - আপনার জিজ্ঞাসা | Amar Talim`;
  const description = post.questionDetails ? post.questionDetails.substring(0, 160) : "Amar Talim Q&A";
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://amar-talim.com"}/qa/${params.slug}`;

  return { 
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
    }
  };
}

export default async function QaDetailsPage({ params }: { params: { slug: string } }) {
  const res = await getQaPostBySlug(params.slug);
  if (!res.ok || !res.data) return notFound();
  
  const post = res.data;
  
  // Async fire-and-forget view count
  recordQaView(post.id).catch(() => {});

  const isPublished = post.status === "PUBLISHED";
  const mufti = post.mufti;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": post.title,
      "text": post.questionDetails || post.title,
      "answerCount": post.answer ? 1 : 0,
      "acceptedAnswer": post.answer ? {
        "@type": "Answer",
        "text": post.answer,
        "author": {
          "@type": "Person",
          "name": mufti?.name || "Amar Talim"
        }
      } : undefined
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SharedNavbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <Button asChild variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/qa"><ChevronLeft className="mr-2 h-4 w-4" /> ফিরে যান</Link>
        </Button>
        
        {!isPublished && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl mb-8 border border-amber-200">
            এই ফতোয়াটি এখনও প্রকাশিত হয়নি বা অপেক্ষমাণ রয়েছে।
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.category && <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{post.category.name}</Badge>}
            <Badge variant="outline">আপনার জিজ্ঞাসা</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold font-serif-bn leading-tight text-foreground">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-y py-3 my-6">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString("bn-BD")}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {post.views} বার পঠিত</span>
            {post.askerName && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> প্রশ্নকারী: {post.askerName}</span>}
          </div>

          {/* Question Box */}
          {post.questionDetails && (
            <div className="bg-secondary/30 rounded-2xl p-6 md:p-8 border relative">
              <HelpCircle className="absolute -top-3 -left-3 h-8 w-8 text-primary/40 bg-background rounded-full" />
              <h3 className="font-bold mb-3 text-lg">বিস্তারিত প্রশ্ন:</h3>
              <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                {post.questionDetails}
              </div>
            </div>
          )}

          {/* Answer Box */}
          {post.answer && (
            <div className="pt-8">
              <h2 className="text-2xl font-bold font-serif-bn mb-6 flex items-center gap-3">
                <span className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center text-sm">উঃ</span>
                শরয়ি সমাধান
              </h2>
              
              <div className="prose prose-slate max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg">
                {post.answer}
              </div>

              {mufti && (
                <div className="mt-12 bg-card border rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar className="h-16 w-16">
                    {mufti.avatar ? <AvatarImage src={mufti.avatar} /> : null}
                    <AvatarFallback>{mufti.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <div className="text-sm text-muted-foreground font-semibold">উত্তর দিয়েছেন</div>
                    <Link href={`/qa/muftis/${mufti.slug}`} className="text-xl font-bold hover:text-primary transition-colors inline-block mt-1">
                      {mufti.name}
                    </Link>
                    {mufti.shortBio && <p className="text-muted-foreground text-sm mt-2">{mufti.shortBio}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
