"use client";

import { Link, useParams } from "@/lib/navigation";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Circle, Loader2, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SharedNavbar from "@/components/shared/navbar";
import YouTubePlayer from "@/components/course/youtube-player";
import LessonSidebar from "@/components/lms/LessonSidebar";
import LessonNotes from "@/components/lms/LessonNotes";
import LessonDiscussion from "@/components/lms/LessonDiscussion";
import { useSession } from "@/server/auth/session";
import { toggleLessonComplete } from "@/server/actions/progress.actions";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface PageClientProps {
  course: any;
  courseLessons: any[];
  completedIds?: string[];
}

const LessonView = ({ course, courseLessons, completedIds = [] }: PageClientProps) => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const lesson = courseLessons.find((l) => l.id === lessonId);
  const currentIndex = courseLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = courseLessons[currentIndex + 1];
  const hasQuiz = lesson?.hasQuiz;

  const { user, isAuthenticated } = useSession();
  const isCompleted = !!lessonId && completedIds.includes(lessonId);
  const [marking, setMarking] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!course || !lesson || !courseId || !lessonId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">পাঠ পাওয়া যায়নি</h1>
          <Link to="/courses"><Button>কোর্সে ফিরে যান</Button></Link>
        </div>
      </div>
    );
  }

  const handleToggleComplete = async () => {
    if (!isAuthenticated) {
      toast({ title: "লগইন প্রয়োজন", description: "অগ্রগতি সংরক্ষণ করতে লগইন করুন।", variant: "destructive" });
      return;
    }
    setMarking(true);
    const res = await toggleLessonComplete(user, courseId, lessonId);
    setMarking(false);
    if ("error" in res) {
      toast({ title: "ব্যর্থ", description: res.error, variant: "destructive" });
      return;
    }
    toast({
      title: res.data.completed ? "পাঠ সম্পন্ন ✓" : "পাঠ অসম্পূর্ণ চিহ্নিত",
    });
  };

  const sidebarLessons = courseLessons.map((l) => ({
    id: l.id,
    title: l.title,
    duration: l.duration,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar
        backTo={`/courses/${courseId}`}
        backLabel={course.title}
        subtitle={`পাঠ ${currentIndex + 1} / ${courseLessons.length}`}
        showDashboard
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0 space-y-6 sm:space-y-8"
          >
            <YouTubePlayer videoId={lesson.youtubeId} title={lesson.title} />

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{lesson.title}</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">{lesson.description}</p>
            </div>

            {/* Mobile: open lesson list drawer */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden w-full rounded-xl font-semibold justify-between min-h-11"
                >
                  <span className="flex items-center gap-2">
                    <ListVideo className="h-4 w-4" />
                    পাঠতালিকা ({currentIndex + 1}/{courseLessons.length})
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] sm:w-96 p-0 flex flex-col">
                <LessonSidebar
                  variant="panel"
                  courseId={courseId}
                  courseTitle={course.title}
                  lessons={sidebarLessons}
                  activeLessonId={lessonId}
                  completedLessonIds={completedIds}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </SheetContent>
            </Sheet>


            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                onClick={handleToggleComplete}
                disabled={marking}
                variant={isCompleted ? "secondary" : "default"}
                className="w-full sm:w-auto rounded-xl font-semibold"
              >
                {marking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <Circle className="mr-2 h-4 w-4" />
                )}
                {isCompleted ? "সম্পন্ন হিসেবে চিহ্নিত" : "সম্পন্ন হিসেবে চিহ্নিত করুন"}
              </Button>

              {hasQuiz && (
                <Link to={`/courses/${courseId}/lessons/${lessonId}/quiz`}>
                  <Button className="w-full sm:w-auto rounded-xl font-semibold bg-gradient-hero hover:opacity-90">
                    কুইজ দিন <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              {nextLesson && (
                <Link to={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl font-semibold">
                    পরবর্তী পাঠ <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>

            <LessonNotes courseId={courseId} lessonId={lessonId} />
            <LessonDiscussion courseId={courseId} lessonId={lessonId} />
          </motion.div>

          {/* Sidebar */}
          <LessonSidebar
            courseId={courseId}
            courseTitle={course.title}
            lessons={sidebarLessons}
            activeLessonId={lessonId}
            completedLessonIds={completedIds}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonView;
