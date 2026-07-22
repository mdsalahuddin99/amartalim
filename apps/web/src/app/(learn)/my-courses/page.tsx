import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPublishedCourses, getPublishedLessons } from "@/server/actions/public.actions";
import { getUserEnrollmentsAction } from "@/server/actions/enrollment.actions";
import { getUserProgressAction } from "@/server/actions/progress.actions";

export const metadata: Metadata = {
  title: "MyCourses | Amar Talim",
};

export default async function Page() {
  const courses = await getPublishedCourses();
  const lessons = await getPublishedLessons();
  const enrollments = await getUserEnrollmentsAction();
  const progressRows = await getUserProgressAction();
  
  return (
    <PageClient 
      courses={courses} 
      lessons={lessons} 
      enrollments={enrollments} 
      progressRows={progressRows} 
    />
  );
}
