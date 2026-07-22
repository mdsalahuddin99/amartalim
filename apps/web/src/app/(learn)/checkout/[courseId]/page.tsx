import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPublishedCourse } from "@/server/actions/public.actions";

export const metadata: Metadata = {
  title: "Checkout | Amar Talim",
};

export default async function Page({ params }: { params: { courseId: string } }) {
  const course = await getPublishedCourse(params.courseId);
  return <PageClient course={course} />;
}
