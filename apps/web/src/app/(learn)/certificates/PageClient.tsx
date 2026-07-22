"use client";

import { Link } from "@/lib/navigation";
import { Award, ArrowRight } from "lucide-react";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/server/auth/session";

interface PageClientProps {
  courses: any[];
  lessons: any[];
  attempts: any[];
}

/**
 * Earned certificates page — lists every passed quiz attempt for the
 * current user, deduped to one certificate per (course, lesson) pair.
 */
const CertificatesPage = ({ courses, lessons, attempts }: PageClientProps) => {
  const { user } = useSession();

  // Keep only the most recent passed attempt per (courseId, lessonId)
  const earned = (() => {
    const seen = new Set<string>();
    return attempts
      .filter((a) => a.passed)
      .filter((a) => {
        const k = `${a.courseId}:${a.lessonId}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
  })();

  return (
    <UserDashboardLayout>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center">
            <Award className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">আমার সার্টিফিকেট</h1>
            <p className="text-sm text-muted-foreground">কুইজে উত্তীর্ণ হয়ে অর্জিত সকল সনদপত্র</p>
          </div>
        </div>

        {!user ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">সার্টিফিকেট দেখতে লগইন করুন</p>
              <Link to="/login"><Button className="rounded-xl">লগইন করুন</Button></Link>
            </CardContent>
          </Card>
        ) : earned.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h2 className="font-semibold mb-2">এখনো কোনো সার্টিফিকেট অর্জিত হয়নি</h2>
              <p className="text-sm text-muted-foreground mb-4">
                পাঠ শেষ করে কুইজে উত্তীর্ণ হলে সার্টিফিকেট এখানে দেখাবে।
              </p>
              <Link to="/my-courses"><Button variant="outline" className="rounded-xl">আমার কোর্স দেখুন</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {earned.map((a) => {
              const course = courses.find((c) => c.id === a.courseId);
              const lesson = lessons.find((l) => l.id === a.lessonId);
              const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
              const date = new Date(a.attemptedAt).toLocaleDateString("bn-BD", {
                year: "numeric", month: "long", day: "numeric",
              });
              return (
                <Card key={a.id} className="overflow-hidden">
                  <div className="h-2 bg-gradient-hero" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{course?.title ?? "কোর্স"}</p>
                        <h3 className="font-semibold truncate">{lesson?.title ?? "পাঠ"}</h3>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                        {pct}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">অর্জনের তারিখ: {date}</p>
                    <Link to={`/certificate/${a.courseId}/${a.lessonId}`}>
                      <Button size="sm" variant="outline" className="w-full rounded-xl">
                        সার্টিফিকেট দেখুন <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </UserDashboardLayout>
  );
};

export default CertificatesPage;
