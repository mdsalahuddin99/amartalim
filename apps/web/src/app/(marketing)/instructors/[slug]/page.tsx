import { Metadata } from "next";
import PageClient from "./PageClient";

import { getInstructorBySlug, getInstructorCourses } from "@/server/queries/instructor.queries";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const instructor = await getInstructorBySlug(params.slug);
  if (!instructor) return { title: "Not Found | Amar Talim" };

  const title = `${instructor.name} | Instructor | Amar Talim`;
  const description = instructor.bio || `Learn from ${instructor.name} on Amar Talim.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://amar-talim.com"}/instructors/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: instructor.avatar ? [{ url: instructor.avatar }] : [],
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const instructor = await getInstructorBySlug(params.slug);
  const courses = instructor ? await getInstructorCourses(instructor.id) : [];

  let jsonLd = null;
  if (instructor) {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": instructor.name,
        "description": instructor.bio,
        "image": instructor.avatar || undefined,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://amar-talim.com"}/instructors/${params.slug}`
      }
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
      <PageClient instructor={instructor} courses={courses} />
    </>
  );
}
