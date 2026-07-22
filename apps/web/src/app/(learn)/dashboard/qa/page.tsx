import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";
import type { QaStatus } from "@prisma/client";

const STATUS_LABEL: Record<QaStatus, string> = {
  PENDING: "অপেক্ষমাণ",
  ANSWERED: "উত্তরিত",
  PUBLISHED: "প্রকাশিত",
  REJECTED: "প্রত্যাখ্যাত",
};

const STATUS_VARIANT: Record<QaStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  ANSWERED: "outline",
  PUBLISHED: "default",
  REJECTED: "destructive",
};

export default async function MyQuestionsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch posts asked by this user
  const posts = await prisma.qaPost.findMany({
    where: { askerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      mufti: true,
    },
  });

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">আমার জিজ্ঞাসা</h1>
          <p className="text-muted-foreground mt-1">
            আপনার করা ইসলামিক জিজ্ঞাসা এবং ফতোয়ার আপডেট এখানে দেখতে পাবেন।
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed text-center p-12 bg-muted/30 min-h-[300px]">
            <h2 className="text-lg font-medium mb-2">কোনো জিজ্ঞাসা পাওয়া যায়নি</h2>
            <p className="text-muted-foreground">
              আপনি এখনো কোনো প্রশ্ন করেননি।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg">{p.title}</h3>
                    <Badge variant={STATUS_VARIANT[p.status]} className="text-[10px]">
                      {STATUS_LABEL[p.status]}
                    </Badge>
                    {p.category && <Badge variant="outline" className="text-[10px]">{p.category.name}</Badge>}
                  </div>
                  
                  {p.questionDetails && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {p.questionDetails}
                    </div>
                  )}

                  {p.answer && p.status !== "PENDING" && p.status !== "REJECTED" && (
                    <div className="mt-2 border-l-4 border-primary pl-4 py-2">
                      <div className="text-xs font-semibold text-primary/80 mb-1 flex items-center gap-2">
                        <span>উত্তরদাতা: {p.mufti?.name || "মুফতি সাহেব"}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{p.answer}</div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground pt-3 border-t">
                    <span>তারিখ: {p.createdAt.toLocaleDateString("bn-BD")}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> ভিউ: {p.views}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
