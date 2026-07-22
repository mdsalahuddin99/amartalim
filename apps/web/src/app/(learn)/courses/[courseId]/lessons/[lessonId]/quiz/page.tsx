import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPublishedCourse, getLessonDetails, getLessonQuiz } from "@/server/actions/public.actions";

export const metadata: Metadata = {
  title: "Quiz | Amar Talim",
};

export default async function Page({ params }: { params: { courseId: string; lessonId: string } }) {
  const course = await getPublishedCourse(params.courseId);
  const lesson = await getLessonDetails(params.lessonId);
  const quiz = await getLessonQuiz(params.lessonId);
  return <PageClient course={course} lesson={lesson} quiz={quiz} />;
}
