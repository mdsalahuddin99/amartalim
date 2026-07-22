import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Play } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Progress } from "@/components/ui/progress";
import type { Course, Lesson } from "@/types/course";

export interface CurriculumEnrollment {
  progress: number;
  doneCount: number;
  completedLessons: string[];
}

export interface CourseCurriculumProps {
  course: Course;
  courseId: string;
  courseLessons: Lesson[];
  enrollment: CurriculumEnrollment | null;
}

export const CourseCurriculum = ({
  course, courseId, courseLessons, enrollment,
}: CourseCurriculumProps) => {
  const [openModule, setOpenModule] = useState(0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {enrollment && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">আপনার অগ্রগতি</span>
            <span className="text-sm font-bold text-primary">{enrollment.progress}%</span>
          </div>
          <Progress value={enrollment.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {enrollment.doneCount}টি / {courseLessons.length}টি পাঠ সম্পন্ন
          </p>
        </div>
      )}

      {course.modules && course.modules.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">কোর্স কারিকুলাম</h2>
            <span className="text-xs text-muted-foreground">
              {course.modules.length}টি মডিউল • {course.lessonsCount}টি পাঠ
            </span>
          </div>
          <div className="space-y-3">
            {course.modules.map((mod, i) => (
              <div key={i} className="rounded-xl border border-border/50 overflow-hidden bg-card">
                <button
                  onClick={() => setOpenModule(openModule === i ? -1 : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{mod.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mod.description} • {mod.lessons.length}টি পাঠ • {mod.duration}
                      </p>
                    </div>
                  </div>
                  {openModule === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {openModule === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-border/50"
                  >
                    <div className="p-3 sm:p-4 space-y-1">
                      {mod.lessons.map((lesson, j) => (
                        <div key={j} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Play className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground flex-1">{lesson}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-4">পাঠ্যক্রম</h2>
          <div className="space-y-2">
            {courseLessons.map((lesson, index) => {
              const isCompleted = enrollment?.completedLessons.includes(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  to={`/courses/${courseId}/lessons/${lesson.id}`}
                  className="group flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isCompleted ? "bg-primary/10" : "bg-primary/5 group-hover:bg-primary/10"}`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Play className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">পাঠ {index + 1}</span>
                      {isCompleted && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">সম্পন্ন</span>}
                    </div>
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">{lesson.title}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{lesson.duration}</span>
                </Link>
              );
            })}
          </div>
          {courseLessons.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>পাঠ্যক্রম শীঘ্রই আসছে...</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CourseCurriculum;
