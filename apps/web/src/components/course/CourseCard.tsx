import { Link } from "@/lib/navigation";
import { BookOpen, Clock, Users, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ReviewRating from "./ReviewRating";
import CourseProgressBar from "./CourseProgressBar";

export interface CourseCardData {
  id: string;
  slug?: string;
  title: string;
  thumbnail?: string;
  categoryName?: string;
  instructor?: string;
  price: number;          // BDT
  originalPrice?: number; // for discount strikethrough
  rating?: number;
  reviewCount?: number;
  studentsCount?: number;
  lessonsCount?: number;
  duration?: string;
  level?: string;
  /** When set, shows progress instead of price (enrolled view). */
  progress?: { completed: number; total: number };
}

type Variant = "grid" | "list" | "featured";

interface Props {
  course: CourseCardData;
  variant?: Variant;
  className?: string;
}

const hrefOf = (c: CourseCardData) => `/courses/${c.slug ?? c.id}`;

const formatBDT = (n: number) =>
  n === 0 ? "ফ্রি" : `৳${n.toLocaleString("bn-BD")}`;

const CourseCard = ({ course, variant = "grid", className }: Props) => {
  if (variant === "list") return <ListCard course={course} className={className} />;
  if (variant === "featured") return <FeaturedCard course={course} className={className} />;
  return <GridCard course={course} className={className} />;
};

/* ─── Grid (default) ─────────────────────────────── */
const GridCard = ({ course, className }: { course: CourseCardData; className?: string }) => (
  <Card className={cn("flex flex-col group hover:shadow-md transition-all border rounded-xl overflow-hidden bg-background p-2.5", className)}>
    <Link to={hrefOf(course)} className="block overflow-hidden rounded-lg bg-muted relative">
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      ) : (
        <div className="aspect-[4/5] bg-gradient-hero" />
      )}
    </Link>
    <div className="pt-3 pb-1 px-1.5 flex-1 flex flex-col">
      {course.categoryName && (
        <Badge variant="secondary" className="self-start mb-2 text-[10px]">
          {course.categoryName}
        </Badge>
      )}
      <Link to={hrefOf(course)}>
        <h3 className="font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
      </Link>
      <Footer course={course} className="mt-auto pt-4" />
    </div>
  </Card>
);

/* ─── List (horizontal row) ──────────────────────── */
const ListCard = ({ course, className }: { course: CourseCardData; className?: string }) => (
  <Card className={cn("overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow", className)}>
    <Link to={hrefOf(course)} className="sm:w-60 shrink-0 bg-muted block">
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="aspect-video sm:aspect-[4/3] w-full h-full object-cover"
        />
      ) : (
        <div className="aspect-video sm:aspect-[4/3] bg-gradient-hero" />
      )}
    </Link>
    <div className="p-4 sm:p-5 flex-1 flex flex-col">
      {course.categoryName && (
        <Badge variant="secondary" className="self-start mb-2 text-[10px]">
          {course.categoryName}
        </Badge>
      )}
      <Link to={hrefOf(course)}>
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
      </Link>
      {course.instructor && (
        <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>
      )}
      <Meta course={course} className="mt-3" />
      <Footer course={course} className="mt-auto pt-4" />
    </div>
  </Card>
);

/* ─── Featured (large, hero-like) ────────────────── */
const FeaturedCard = ({ course, className }: { course: CourseCardData; className?: string }) => (
  <Card className={cn("overflow-hidden relative group", className)}>
    <Link to={hrefOf(course)}>
      <div className="aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-background">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary text-[10px]">
            ফিচারড
          </Badge>
          {course.categoryName && (
            <Badge variant="outline" className="text-[10px] border-background/30 text-background">
              {course.categoryName}
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-xl sm:text-2xl line-clamp-2">{course.title}</h3>
        {course.instructor && (
          <p className="text-sm text-background/70 mt-1">{course.instructor}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-background/80">
          {typeof course.rating === "number" && course.rating > 0 && (
            <ReviewRating value={course.rating} count={course.reviewCount} size="sm" />
          )}
          {typeof course.studentsCount === "number" && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {course.studentsCount.toLocaleString("bn-BD")}+
            </span>
          )}
          {course.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {course.duration}
            </span>
          )}
        </div>
      </div>
    </Link>
  </Card>
);

/* ─── Shared bits ────────────────────────────────── */
const Meta = ({ course, className }: { course: CourseCardData; className?: string }) => (
  <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground", className)}>
    {typeof course.rating === "number" && course.rating > 0 && (
      <ReviewRating value={course.rating} count={course.reviewCount} size="sm" />
    )}
    {typeof course.lessonsCount === "number" && (
      <span className="inline-flex items-center gap-1">
        <BookOpen className="h-3 w-3" /> {course.lessonsCount}টি পাঠ
      </span>
    )}
    {course.duration && (
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" /> {course.duration}
      </span>
    )}
  </div>
);

const Footer = ({ course, className }: { course: CourseCardData; className?: string }) => {
  if (course.progress) {
    return (
      <div className={className}>
        <CourseProgressBar
          completed={course.progress.completed}
          total={course.progress.total}
          size="sm"
        />
      </div>
    );
  }
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-1.5">
        <p className="text-[17px] font-bold text-orange-500">{formatBDT(course.price)}</p>
        {course.originalPrice && course.originalPrice > course.price && (
          <p className="text-[12px] text-muted-foreground line-through opacity-70">
            ৳{course.originalPrice.toLocaleString("bn-BD")}
          </p>
        )}
      </div>
      <Link to={hrefOf(course)} onClick={(e) => e.stopPropagation()}>
        <Button size="sm" className="bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md h-7 px-3 text-[11px] flex items-center gap-1.5">
          Details <Eye className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
};

export default CourseCard;
