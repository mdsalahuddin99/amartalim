"use client";

import { useMemo, useState } from "react";
import { Link, useParams } from "@/lib/navigation";
import {
  BookOpen, FileText, GraduationCap, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SharedNavbar from "@/components/shared/navbar";
import type { Course, Lesson } from "@/types/course";
import { useSession } from "@/server/auth/session";
import {
  CourseHero,
  CourseTabsNav,
  CourseOverview,
  CourseCurriculum,
  CourseInstructor,
  CourseReviews,
  EnrollCard,
  type CourseTab,
  type CourseTabId,
} from "@/components/course/detail";

/**
 * Course detail page — composition only. Each tab section + the enrollment
 * card lives in `src/components/course/detail/*` so that after the Next.js
 * migration each presentational piece can become a Server Component, while
 * the small interactive shell (tab state) stays as a client component.
 */
interface CourseDetailProps {
  course: any;
  otherCourses?: any[];
  enrollmentRecord?: any;
  completedLessons?: string[];
}

const CourseDetail = ({ course, otherCourses = [], enrollmentRecord = null, completedLessons = [] }: CourseDetailProps) => {
  const { user } = useSession();

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Course not found</p>
      </div>
    );
  }

  const courseId = course.id;
  const courseLessons = course.lessons || [];

  const enrollment = useMemo(() => {
    if (!enrollmentRecord) return null;
    const total = courseLessons.length;
    const done = completedLessons.filter((id) => id !== "__enrolled__").length;
    return {
      completedLessons,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      doneCount: done,
    };
  }, [enrollmentRecord, completedLessons, courseLessons.length]);

  const firstLessonId = courseLessons[0]?.id ?? "";
  const nextLessonId =
    courseLessons.find((l) => !completedLessons.includes(l.id))?.id ?? firstLessonId;

  const courseReviews = (course.reviews || []).filter((r: any) => r.courseId === courseId);
  const avgRating = courseReviews.length > 0
    ? (courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length).toFixed(1)
    : course?.rating ?? 0;

  const [activeTab, setActiveTab] = useState<CourseTabId>("overview");

  if (!course || !courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">কোর্স পাওয়া যায়নি</h1>
          <Link to="/courses"><Button>কোর্সে ফিরে যান</Button></Link>
        </div>
      </div>
    );
  }

  const tabs: CourseTab[] = [
    { id: "overview", label: "ওভারভিউ", icon: <FileText className="h-4 w-4" /> },
    { id: "curriculum", label: "কারিকুলাম", icon: <BookOpen className="h-4 w-4" /> },
    { id: "instructor", label: "প্রশিক্ষক", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "reviews", label: `রিভিউ (${courseReviews.length})`, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar backTo="/courses" showDashboard />

      <CourseHero
        course={course}
        courseId={courseId}
        avgRating={avgRating}
        reviewsCount={courseReviews.length}
        isEnrolled={!!enrollment}
        nextLessonId={nextLessonId}
      />

      <CourseTabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "overview" && <CourseOverview course={course} />}
            {activeTab === "curriculum" && (
              <CourseCurriculum
                course={course}
                courseId={courseId}
                courseLessons={courseLessons}
                enrollment={enrollment}
              />
            )}
            {activeTab === "instructor" && (
              <CourseInstructor course={course} avgRating={avgRating} allCourses={otherCourses} />
            )}
            {activeTab === "reviews" && (
              <CourseReviews reviews={courseReviews} avgRating={avgRating} />
            )}
          </div>

          <EnrollCard
            course={course}
            courseId={courseId}
            enrollment={enrollment}
            nextLessonId={nextLessonId}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
