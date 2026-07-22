import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageClient from "./PageClient";
import { getCourseWithLessons } from "@/server/queries/course.queries";
import { getInstructorCourses } from "@/server/queries/instructor.queries";
import { getUserEnrollmentAction } from "@/server/actions/enrollment.actions";
import { getUserProgressAction } from "@/server/actions/progress.actions";

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  // If getCourseWithLessons isn't fully ready yet, it might throw, so wrap in try-catch or just call it.
  try {
    const course = await getCourseWithLessons(params.courseId);
    if (!course) return { title: "Course Not Found | Amar Talim" };

    const title = `${course.title} | Amar Talim`;
    const description = course.description || "Learn this comprehensive course on Amar Talim.";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amar-talim.com";
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/courses/${params.courseId}`,
        type: "article",
        images: course.thumbnail ? [
          {
            url: course.thumbnail,
            width: 1200,
            height: 630,
            alt: course.title,
          }
        ] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: course.thumbnail ? [course.thumbnail] : [],
      },
    };
  } catch (err) {
    return { title: "Course | Amar Talim" };
  }
}

export default async function Page({ params }: { params: { courseId: string } }) {
  const course = await getCourseWithLessons(params.courseId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amar-talim.com";
  
  const enrollment = await getUserEnrollmentAction(params.courseId);
  const completedLessons = await getUserProgressAction(params.courseId) as string[];

  let otherCourses: any[] = [];
  if (course?.instructorId) {
    otherCourses = await getInstructorCourses(course.instructorId);
  }

  let jsonLd = null;
  if (course) {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description || "Learn this comprehensive course on Amar Talim.",
      "provider": {
        "@type": "Organization",
        "name": "Amar Talim",
        "sameAs": siteUrl
      },
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PageClient course={course} otherCourses={otherCourses} enrollmentRecord={enrollment} completedLessons={completedLessons} />
    </>
  );
}
