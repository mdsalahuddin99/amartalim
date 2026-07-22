import { motion } from "framer-motion";
import { BookOpen, Star, Users } from "lucide-react";
import { Link } from "@/lib/navigation";
import SmartImage from "@/components/shared/SmartImage";
export interface CourseInstructorProps {
  course: any;
  avgRating: string | number;
  /** All courses (the section filters down to other courses by the same instructor). */
  allCourses: any[];
}

export const CourseInstructor = ({ course, avgRating, allCourses }: CourseInstructorProps) => {
  const otherCourses = allCourses
    .filter((c) => c.id !== course.id)
    .slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground text-3xl font-bold shrink-0">
            {course.instructor?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{course.instructor?.name || "প্রশিক্ষক"}</h2>
            <p className="text-sm text-primary font-medium mt-1">প্রশিক্ষক</p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {course.instructor?.bio || "অভিজ্ঞ প্রশিক্ষক।"}
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {avgRating} রেটিং
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {course.studentCount || 0}+ শিক্ষার্থী
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {course.lessons?.length || 0}টি পাঠ
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-3">এই প্রশিক্ষকের অন্যান্য কোর্স</h3>
        <div className="space-y-3">
          {otherCourses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card transition-all group"
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-secondary">
                {c.thumbnail && <SmartImage src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium group-hover:text-primary transition-colors truncate">{c.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{c.rating ? c.rating.toFixed(1) : "0.0"}</span>
                  <span>{c.studentCount || 0}+ শিক্ষার্থী</span>
                </div>
              </div>
              <span className="text-sm font-bold text-primary shrink-0">৳{c.price.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseInstructor;
