import { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./PageClient";
import { getPublishedCourses, getCourseCategories } from "@/server/queries/course.queries";

export const metadata: Metadata = {
  title: "Courses | Amar Talim",
  description: "Explore our comprehensive courses on Quran, Arabic language, digital marketing, freelancing, and more.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: "Courses | Amar Talim",
    description: "Explore our comprehensive courses on Quran, Arabic language, digital marketing, freelancing, and more.",
    url: "/courses",
    type: "website",
  },
};

export default async function Page() {
  const [courses, categories] = await Promise.all([
    getPublishedCourses(),
    getCourseCategories(),
  ]);

  return (
    <Suspense>
      <PageClient courses={courses} categories={categories} />
    </Suspense>
  );
}
