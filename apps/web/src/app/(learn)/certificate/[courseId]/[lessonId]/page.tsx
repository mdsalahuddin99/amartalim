import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPublishedCourse, getLessonDetails } from "@/server/actions/public.actions";

export const metadata: Metadata = {
  title: "Certificate | Amar Talim",
};

export default async function Page({ params }: { params: { courseId: string; lessonId: string } }) {
  const course = await getPublishedCourse(params.courseId);
  const lesson = await getLessonDetails(params.lessonId);
  return <PageClient course={course} lesson={lesson} />;
}
