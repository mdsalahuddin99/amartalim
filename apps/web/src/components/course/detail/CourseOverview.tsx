import { motion } from "framer-motion";
import {
  AlertCircle, Award, CheckCircle2, Clock, Globe, Heart, Monitor, Play, Shield, Target,
} from "lucide-react";
import type { Course } from "@/types/course";

export interface CourseOverviewProps {
  course: Course;
}

export const CourseOverview = ({ course }: CourseOverviewProps) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    {/* Problems */}
    {course.problems && course.problems.length > 0 && (
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          আপনি কি এই সমস্যায় আছেন?
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {course.problems.map((problem, i) => (
            <div key={i} className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 hover:border-destructive/20 transition-colors">
              <h3 className="font-semibold text-sm mb-2 text-destructive">{problem.title}</h3>
              <ul className="space-y-1.5">
                {problem.items.map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
          <p className="text-sm text-primary font-medium">
            ✨ যে সমস্যাতেই থাকেন না কেন, এই কোর্সে আপনার সমাধান আছে!
          </p>
        </div>
      </div>
    )}

    {/* What you learn */}
    {course.whatYouLearn && course.whatYouLearn.length > 0 && (
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          এই কোর্সে যা শিখবেন
        </h2>
        <div className="grid sm:grid-cols-2 gap-2.5 p-5 rounded-xl border border-primary/10 bg-primary/[0.02]">
          {course.whatYouLearn.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Who is for */}
    {course.whoIsFor && course.whoIsFor.length > 0 && (
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          কার জন্য এই কোর্স?
        </h2>
        <div className="space-y-2.5">
          {course.whoIsFor.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border/50">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm mt-0.5">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Course includes */}
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
        <Monitor className="h-5 w-5 text-primary" />
        কোর্সে যা যা থাকছে
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { icon: Play, label: `${course.lessonsCount}টি ভিডিও লেসন`, color: "bg-primary/10 text-primary" },
          { icon: Clock, label: course.duration, color: "bg-warning/10 text-warning" },
          { icon: Award, label: "সার্টিফিকেট", color: "bg-success/10 text-success" },
          { icon: Shield, label: "আজীবন অ্যাক্সেস", color: "bg-primary/10 text-primary" },
          { icon: Globe, label: "বাংলা ভাষায়", color: "bg-warning/10 text-warning" },
          { icon: Target, label: "প্র্যাক্টিস কুইজ", color: "bg-success/10 text-success" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50">
            <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
              <item.icon className="h-4 w-4" />
            </div>
            <span className="text-xs sm:text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default CourseOverview;
