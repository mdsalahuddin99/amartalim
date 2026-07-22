import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPublishedCourse, getCourseLessons } from "@/server/actions/public.actions";
import { getUserProgressAction } from "@/server/actions/progress.actions";

export const metadata: Metadata = {
  title: "Lesson | Amar Talim",
};

export default async function Page({ params }: { params: { courseId: string; lessonId: string } }) {
  const course = await getPublishedCourse(params.courseId);
  const courseLessons = await getCourseLessons(params.courseId);
  const completedIds = await getUserProgressAction(params.courseId) as string[];
  return <PageClient course={course} courseLessons={courseLessons} completedIds={completedIds} />;
}
