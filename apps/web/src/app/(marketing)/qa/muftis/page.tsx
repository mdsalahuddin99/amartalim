import { Metadata } from "next";
import { Link } from "@/lib/navigation";
import { getMuftis } from "@/server/actions/mufti.actions";
import SharedNavbar from "@/components/shared/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "মুফতি সাহেবগণ - আপনার জিজ্ঞাসা | Amar Talim",
  description: "আমাদের বিজ্ঞ মুফতি সাহেবদের তালিকা।",
};

export const revalidate = 60;

export default async function MuftisPage() {
  const res = await getMuftis();
  const muftis = res.ok && res.data ? res.data.filter(m => m.status === "APPROVED") : [];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <SharedNavbar />
      
      <div className="bg-primary/5 border-b py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20" variant="secondary">আপনার জিজ্ঞাসা</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif-bn text-foreground">মুফতি সাহেবগণ</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            আমাদের বিজ্ঞ মুফতি সাহেবদের প্যানেল, যারা আপনার বিভিন্ন ইসলামিক প্রশ্নের নির্ভরযোগ্য শরয়ি সমাধান দিয়ে থাকেন।
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        {muftis.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-2xl bg-card shadow-sm">
            এখনও কোনো মুফতি সাহেবের প্রোফাইল যুক্ত করা হয়নি।
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {muftis.map((mufti) => (
              <Link key={mufti.id} href={`/qa/muftis/${mufti.slug}`} className="block group">
                <Card className="h-full p-6 transition-all hover:shadow-md border-border/50 hover:border-primary/30 flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4 border-2 border-background shadow-sm">
                    {mufti.avatar ? <AvatarImage src={mufti.avatar} /> : null}
                    <AvatarFallback className="text-3xl">{mufti.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-1.5 mb-2">
                    <h3 className="text-xl font-bold font-serif-bn group-hover:text-primary transition-colors">
                      {mufti.name}
                    </h3>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  
                  {mufti.shortBio && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {mufti.shortBio}
                    </p>
                  )}
                  
                  {mufti.expertise && mufti.expertise.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mt-auto mb-4">
                      {mufti.expertise.slice(0, 2).map((exp) => (
                        <Badge key={exp} variant="secondary" className="font-normal text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {mufti.expertise.length > 2 && (
                        <span className="text-xs text-muted-foreground pl-1">+{mufti.expertise.length - 2}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-primary text-sm font-medium flex items-center mt-auto pt-2 border-t w-full justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    প্রোফাইল দেখুন <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
