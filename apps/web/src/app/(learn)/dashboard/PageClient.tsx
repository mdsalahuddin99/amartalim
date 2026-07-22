"use client";

import { useMemo } from "react";
import { Link } from "@/lib/navigation";
import { motion } from "framer-motion";
import { BookOpen, Award, TrendingUp, ChevronRight, Play, Flame, Target, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fadeUp } from "@/lib/animations";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { useUserPanelSession } from "@/server/auth/session";

import SmartImage from "@/components/shared/SmartImage";
const StudentDashboard = ({ initialData }: { initialData?: any }) => {
  const { user, isAuthenticated, role } = useUserPanelSession();
  const { enrollments = [], progress = [], attempts = [], applications = [], isAuthor = false, isInstructor = false, isMufti = false } = initialData || {};

  const enrolledCourses = useMemo(() => {
    return enrollments
      .map((enr: any) => {
        const course = enr.course;
        if (!course) return null;
        
        const courseLessons = course.lessons || [];
        const total = Math.max(courseLessons.length, course.lessonsCount || 0);
        
        // Find completed lesson ids for this course
        const completedLessonIds = progress
          .filter((p: any) => p.lessonId && courseLessons.some((l: any) => l.id === p.lessonId) && p.completed)
          .map((p: any) => p.lessonId);
          
        const done = completedLessonIds.length;
        const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;
        const nextLesson = courseLessons.find((l: any) => !completedLessonIds.includes(l.id));
        
        return { 
          course: {
            ...course,
            categoryName: course.category?.name || "Uncategorized"
          }, 
          total, 
          done, 
          progress: progressPercent, 
          nextLesson 
        };
      })
      .filter((x: any): x is NonNullable<typeof x> => !!x);
  }, [enrollments, progress]);

  const totalCompleted = enrolledCourses.filter((e: any) => e.progress === 100).length;
  const avgProgress = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((s: any, e: any) => s + e.progress, 0) / enrolledCourses.length)
    : 0;
  const passedQuizzes = attempts.filter((a: any) => a.passed).length;
  const continueCourse = enrolledCourses.find((e: any) => e.progress > 0 && e.progress < 100) ?? enrolledCourses[0];
  const firstName = (user?.name ?? "শিক্ষার্থী").split(" ")[0];

  // Not authenticated via user-panel session → redirect to dashboard login
  if (!isAuthenticated && role !== null) return null; // still loading
  if (!isAuthenticated) {
    return (
    <UserDashboardLayout isAuthor={isAuthor} isInstructor={isInstructor} isMufti={isMufti}>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <LogIn className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">ড্যাশবোর্ড দেখতে লগইন করুন</h1>
          <p className="text-muted-foreground mb-6 text-sm">আপনার কোর্স ও অগ্রগতি দেখতে অনুগ্রহ করে লগইন করুন।</p>
          <Link to="/dashboard/login">
            <Button className="rounded-xl">লগইন করুন</Button>
          </Link>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout isAuthor={isAuthor} isInstructor={isInstructor} isMufti={isMufti}>
      <div className="max-w-7xl mx-auto py-2 sm:py-6">
        <motion.div initial="hidden" animate="visible">
          {/* Welcome Banner */}
          <motion.div custom={0} variants={fadeUp} className="mb-6 sm:mb-8 p-5 sm:p-8 rounded-2xl bg-gradient-hero relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-foreground/20 blur-3xl" />
            </div>
            <div className="relative z-10">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-foreground">
                স্বাগতম, {firstName} 👋
              </h1>
              <p className="text-primary-foreground/70 mt-1 text-sm">
                {continueCourse ? "যেখানে থেমেছিলেন সেখান থেকে শুরু করুন" : "এখনই একটি কোর্সে এনরোল করুন"}
              </p>
              {continueCourse ? (
                <Link
                  to={
                    continueCourse.nextLesson
                      ? `/courses/${continueCourse.course.id}/lessons/${continueCourse.nextLesson.id}`
                      : `/courses/${continueCourse.course.id}`
                  }
                >
                  <Button className="mt-4 rounded-xl bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 font-semibold backdrop-blur-sm">
                    <Play className="mr-2 h-4 w-4" /> {continueCourse.course.title} চালিয়ে যান
                  </Button>
                </Link>
              ) : (
                <Link to="/courses">
                  <Button className="mt-4 rounded-xl bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 font-semibold backdrop-blur-sm">
                    কোর্স ব্রাউজ করুন
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div custom={1} variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[
              { icon: BookOpen, label: "ভর্তি হয়েছেন", value: enrolledCourses.length, color: "text-primary" },
              { icon: Award, label: "সম্পন্ন", value: totalCompleted, color: "text-success" },
              { icon: TrendingUp, label: "গড় অগ্রগতি", value: `${avgProgress}%`, color: "text-warning" },
              { icon: Target, label: "কুইজ উত্তীর্ণ", value: passedQuizzes, color: "text-destructive" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>



          {/* Courses */}
          <motion.div custom={2} variants={fadeUp}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">আমার কোর্সসমূহ</h2>
              <Link to="/my-courses" className="text-sm text-primary font-medium flex items-center gap-1">
                সব দেখুন <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">এখনো কোনো কোর্সে এনরোল করেননি।</p>
                <Link to="/courses"><Button className="rounded-xl">কোর্স ব্রাউজ করুন</Button></Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {enrolledCourses.map((e, i) => (
                  <motion.div key={e.course.id} custom={i + 3} variants={fadeUp}>
                    <Link
                      to={
                        e.nextLesson
                          ? `/courses/${e.course.id}/lessons/${e.nextLesson.id}`
                          : `/courses/${e.course.id}`
                      }
                      className="block rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
                    >
                      <div className="aspect-video bg-gradient-subtle flex items-center justify-center relative overflow-hidden">
                        {e.course.thumbnail ? (
                          <SmartImage src={e.course.thumbnail} alt={e.course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Play className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                        )}
                        {e.progress === 100 && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-success text-success-foreground text-xs font-semibold flex items-center gap-1">
                            <Award className="h-3 w-3" /> সম্পন্ন
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        <span className="text-xs font-medium text-primary">{e.course.categoryName}</span>
                        <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">{e.course.title}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{e.done}টি / {e.total}টি পাঠ</span>
                            <span className="font-semibold">{e.progress}%</span>
                          </div>
                          <Progress value={e.progress} className="h-1.5" />
                        </div>
                        {e.nextLesson && e.progress < 100 && (
                          <div className="pt-2 border-t text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                            <Play className="w-3 h-3 text-primary shrink-0" />
                            <span className="truncate">পরবর্তী: {e.nextLesson.title}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quiz Results */}
          <motion.div custom={6} variants={fadeUp} className="mt-10 sm:mt-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">সাম্প্রতিক কুইজ ফলাফল</h2>
              <Link to="/certificates" className="text-sm text-primary font-medium flex items-center gap-1">
                সার্টিফিকেট <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {attempts.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-2xl text-sm text-muted-foreground">
                এখনো কোনো কুইজ দেওয়া হয়নি।
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
                <div className="divide-y divide-border/50">
                  {attempts.slice(0, 8).map((attempt: any) => {
                    const course = attempt.quiz?.lesson?.course;
                    const lesson = attempt.quiz?.lesson;
                    const title = attempt.quiz?.title || lesson?.title || "কুইজ";
                    
                    return (
                      <Link
                        key={attempt.id}
                        to={
                          attempt.passed
                            ? `/certificate/${course?.id || ""}/${lesson?.id || ""}`
                            : `/courses/${course?.id || ""}/lessons/${lesson?.id || ""}/quiz`
                        }
                        className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${attempt.passed ? "bg-success/10" : "bg-destructive/10"}`}>
                            <Flame className={`h-4 w-4 ${attempt.passed ? "text-success" : "text-destructive"}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {course?.title || "Unknown Course"} • {new Date(attempt.startedAt || attempt.createdAt).toLocaleDateString("bn-BD")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <span className={`text-sm font-semibold ${attempt.passed ? "text-success" : "text-destructive"}`}>
                            {attempt.score}/{attempt.total}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            attempt.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          }`}>
                            {attempt.passed ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </UserDashboardLayout>
  );
};

export default StudentDashboard;
