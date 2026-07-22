import { motion } from "framer-motion";
import {
  Award, BookOpen, CheckCircle2, GraduationCap, Play, Share2, Shield, Users,
} from "lucide-react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SmartImage from "@/components/shared/SmartImage";
import WishlistButton from "@/components/course/WishlistButton";
import type { Course } from "@/lib/seed/mock-data";

export interface EnrollCardEnrollment {
  progress: number;
}

export interface EnrollCardProps {
  course: Course;
  courseId: string;
  enrollment: EnrollCardEnrollment | null;
  nextLessonId: string;
}

/** Sticky right-rail enrollment / progress card + course benefits. */
export const EnrollCard = ({ course, courseId, enrollment, nextLessonId }: EnrollCardProps) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="hidden lg:block">
    <div className="sticky top-28 space-y-4">
      <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
        {course.thumbnail && (
          <div className="relative aspect-video overflow-hidden">
            <SmartImage src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-background/90 flex items-center justify-center shadow-lg">
                <Play className="h-6 w-6 text-primary ml-1" />
              </div>
            </div>
          </div>
        )}
        <div className="p-6 space-y-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">৳{course.price.toLocaleString()}</span>
          </div>

          {enrollment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>অগ্রগতি</span>
                <span className="font-bold text-primary">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
              <Link to={`/courses/${courseId}/lessons/${nextLessonId}`}>
                <Button className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90">
                  <Play className="mr-2 h-4 w-4" /> শেখা চালিয়ে যান
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              <Link to={`/checkout/${courseId}`}>
                <Button className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90">
                  এখনই ভর্তি হন
                </Button>
              </Link>
              <WishlistButton courseId={courseId} variant="outline" className="w-full h-10 text-sm" />
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-2.5 pt-4 border-t border-border/50">
            <p className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary" /> আজীবন অ্যাক্সেস</p>
            <p className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5 text-primary" /> সমাপ্তির সার্টিফিকেট</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> প্রতিটি পাঠের পরে কুইজ</p>
            <p className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-primary" /> {course.lessonsCount}টি ভিডিও ক্লাস</p>
            <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> {course.studentsCount}+ শিক্ষার্থী</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> শেয়ার করুন
            </Button>
          </div>
        </div>
      </div>

      {course.benefits && course.benefits.length > 0 && (
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            কেন এই কোর্সটি সেরা?
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            {course.benefits.map((b, i) => (
              <p key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> {b}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default EnrollCard;
