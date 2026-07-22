import { motion } from "framer-motion";
import { Bookmark, BookOpen, Clock, Globe, Star, Users } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import SmartImage from "@/components/shared/SmartImage";
import type { Course } from "@/lib/seed/mock-data";

export interface CourseHeroProps {
  course: Course;
  courseId: string;
  avgRating: string | number;
  reviewsCount: number;
  isEnrolled: boolean;
  nextLessonId: string;
}

export const CourseHero = ({
  course, courseId, avgRating, reviewsCount, isEnrolled, nextLessonId,
}: CourseHeroProps) => (
  <div className="relative bg-foreground">
    {course.thumbnail ? (
      <div className="absolute inset-0">
        <SmartImage src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-foreground/40" />
      </div>
    ) : (
      <div className="absolute inset-0 bg-gradient-hero opacity-20" />
    )}

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-8 sm:pb-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 text-xs text-background/60 mb-4">
          <Link to="/" className="hover:text-background/80 transition-colors">হোম</Link>
          <span>/</span>
          <Link to="/courses" className="hover:text-background/80 transition-colors">কোর্সসমূহ</Link>
          <span>/</span>
          <span className="text-background/80">{course.categoryName}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
            {course.categoryName}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-background/10 text-background/80 border border-background/20">
            {course.level}
          </span>
          {course.rating >= 4.8 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/20 text-warning border border-warning/30">
              ⭐ বেস্ট সেলার
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-background leading-tight max-w-3xl">
          {course.title}
        </h1>
        <p className="text-background/70 mt-3 max-w-2xl text-sm sm:text-base leading-relaxed">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-5 text-xs sm:text-sm text-background/60">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-semibold text-background">{avgRating}</span>
            <span>({reviewsCount}টি রিভিউ)</span>
          </span>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{course.studentsCount}+ শিক্ষার্থী</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.duration}</span>
          <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{course.lessonsCount}টি পাঠ</span>
          <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />বাংলা</span>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm border-2 border-background/20">
            {course.instructor.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-background">{course.instructor}</p>
            <p className="text-xs text-background/50">প্রশিক্ষক</p>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="flex items-center gap-3 mt-6 sm:hidden">
          <Link to={isEnrolled ? `/courses/${courseId}/lessons/${nextLessonId}` : `/checkout/${courseId}`} className="flex-1">
            <Button className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90">
              {isEnrolled ? "শেখা চালিয়ে যান" : `৳${course.price.toLocaleString()} — ভর্তি হন`}
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-background/20 text-background hover:bg-background/10">
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  </div>
);

export default CourseHero;
