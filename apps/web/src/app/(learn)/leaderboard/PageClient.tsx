"use client";

import { useMemo, useState } from "react";
import { Trophy, Medal, Award, Flame, BookOpen, GraduationCap } from "lucide-react";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "@/server/auth/session";

const rankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const LeaderboardPage = ({ initialRows = [] }: { initialRows?: any[] }) => {
  const { user } = useSession();
  const [tab, setTab] = useState<"all" | "lessons" | "quizzes">("all");

  const sorted = useMemo(() => {
    const list = [...initialRows];
    if (tab === "lessons") list.sort((a, b) => b.completedLessons - a.completedLessons);
    else if (tab === "quizzes") list.sort((a, b) => b.quizCount - a.quizCount);
    return list.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [initialRows, tab]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const myRow = user ? sorted.find((r) => r.userId === user.id) : undefined;

  return (
    <UserDashboardLayout>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white mb-4 shadow-lg">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="font-serif-bn font-black text-3xl sm:text-4xl">লিডারবোর্ড</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            পাঠ সম্পন্ন, কুইজ অংশগ্রহণ ও কোর্স ভর্তির ভিত্তিতে শীর্ষ শিক্ষার্থীদের তালিকা।
          </p>
        </header>

        {myRow && (
          <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="w-10 flex justify-center">{rankIcon(myRow.rank)}</div>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{myRow.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{myRow.name} <Badge className="ml-2 text-[10px]">আপনি</Badge></p>
                <p className="text-xs text-muted-foreground">
                  {myRow.completedLessons} পাঠ · {myRow.quizCount} কুইজ · {myRow.enrolledCount} কোর্স
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-primary">{myRow.points}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">পয়েন্ট</p>
              </div>
            </div>
          </Card>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid mb-6">
            <TabsTrigger value="all"><Flame className="h-3.5 w-3.5 mr-1.5" /> সর্বমোট</TabsTrigger>
            <TabsTrigger value="lessons"><BookOpen className="h-3.5 w-3.5 mr-1.5" /> পাঠ</TabsTrigger>
            <TabsTrigger value="quizzes"><GraduationCap className="h-3.5 w-3.5 mr-1.5" /> কুইজ</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-6">
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {top3.map((r) => (
                  <Card
                    key={r.userId}
                    className={cn(
                      "p-5 text-center relative overflow-hidden",
                      r.rank === 1 && "border-yellow-400/60 bg-gradient-to-b from-yellow-50 to-background dark:from-yellow-950/20",
                      r.rank === 2 && "border-gray-300",
                      r.rank === 3 && "border-amber-700/40",
                    )}
                  >
                    <div className="absolute top-2 right-2">{rankIcon(r.rank)}</div>
                    <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-primary/20">
                      <AvatarFallback className="text-xl">{r.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold truncate">{r.name}</p>
                    <p className="text-3xl font-black text-primary mt-2">{r.points}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">পয়েন্ট</p>
                    <div className="flex justify-center gap-3 mt-3 text-[11px] text-muted-foreground">
                      <span>{r.completedLessons} পাঠ</span>
                      <span>·</span>
                      <span>{r.quizCount} কুইজ</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Card className="overflow-hidden">
              <div className="divide-y">
                {rest.length === 0 && top3.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground">
                    এখনো কোনো ডেটা নেই। পাঠ সম্পন্ন করলে আপনি র‍্যাঙ্কিং-এ চলে আসবেন।
                  </div>
                ) : (
                  rest.map((r) => (
                    <div
                      key={r.userId}
                      className={cn(
                        "flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors",
                        user?.id === r.userId && "bg-primary/5",
                      )}
                    >
                      <div className="w-10 flex justify-center">{rankIcon(r.rank)}</div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{r.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.completedLessons} পাঠ · {r.quizCount} কুইজ · {r.enrolledCount} কোর্স
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{r.points}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">পয়েন্ট</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </UserDashboardLayout>
  );
};

export default LeaderboardPage;
