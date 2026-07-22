"use client";

import { useMemo } from "react";
import { Link } from "@/lib/navigation";
import { BookOpen, Search, Award, Play } from "lucide-react";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { Button } from "@/components/ui/button";
import { useSession } from "@/server/auth/session";
import CourseProgressBar from "@/components/course/CourseProgressBar";

interface PageClientProps {
  courses: any[];
  lessons: any[];
  enrollments: any[];
  progressRows: any[];
}

const MyCoursesPage = ({ courses, lessons, enrollments, progressRows }: PageClientProps) => {
  const { user, isAuthenticated } = useSession();

  const enrolled = useMemo(() => {
    return enrollments
      .map((enr) => {
        const course = courses.find((c) => c.id === enr.courseId);
        if (!course) return null;
        const courseLessons = lessons.filter((l) => l.courseId === course.id);
        const total = Math.max(courseLessons.length, course.lessonsCount);
        const progress = progressRows.find((p) => p.courseId === course.id);
        const done = (progress?.completedLessons ?? []).filter((id) => id !== "__enrolled__").length;
        const nextLesson = courseLessons.find((l) => !(progress?.completedLessons ?? []).includes(l.id));
        return { course, total, done, nextLesson };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [enrollments, progressRows, courses, lessons]);

  return (
    <UserDashboardLayout>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-10 pb-4 border-b-2 border-foreground flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">আপনার শেখার যাত্রা</p>
            <h1 className="font-serif-bn font-black text-3xl sm:text-5xl flex items-center gap-3">
              <BookOpen className="w-8 h-8" /> আমার কোর্স
            </h1>
          </div>
          <Link to="/courses">
            <Button variant="outline" className="rounded-none">
              <Search className="w-4 h-4 mr-1" /> আরো কোর্স দেখুন
            </Button>
          </Link>
        </header>

        {!isAuthenticated ? (
          <div className="text-center py-16 border border-dashed">
            <p className="font-serif-bn text-lg mb-4">কোর্স দেখতে দয়া করে লগইন করুন।</p>
            <Link to="/login?from=/my-courses">
              <Button className="rounded-none">লগইন</Button>
            </Link>
          </div>
        ) : enrolled.length === 0 ? (
          <div className="text-center py-16 border border-dashed">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-serif-bn text-lg mb-4">এখনো কোনো কোর্সে এনরোল করেননি।</p>
            <Link to="/courses">
              <Button className="rounded-none">কোর্স ব্রাউজ করুন</Button>
            </Link>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolled.map(({ course, total, done, nextLesson }) => {
              const completed = total > 0 && done >= total;
              return (
                <li key={course.id}>
                  <Link
                    to={`/courses/${course.id}`}
                    className="block rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                        />
                      )}
                      {completed && (
                        <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" /> সম্পন্ন
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="eyebrow">{course.categoryName}</p>
                      <h3 className="font-serif-bn font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <CourseProgressBar completed={done} total={total} size="sm" showLabel />
                      {!completed && nextLesson && (
                        <div className="pt-2 border-t text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                          <Play className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">পরবর্তী: {nextLesson.title}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </UserDashboardLayout>
  );
};

export default MyCoursesPage;
