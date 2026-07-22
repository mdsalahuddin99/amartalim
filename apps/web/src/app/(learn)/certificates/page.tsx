import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPublishedCourses, getPublishedLessons } from "@/server/actions/public.actions";
import { getUserQuizAttemptsAction } from "@/server/actions/progress.actions";

export const metadata: Metadata = {
  title: "Certificates | Amar Talim",
};

export default async function Page() {
  const courses = await getPublishedCourses();
  const lessons = await getPublishedLessons();
  
  const rawAttempts = await getUserQuizAttemptsAction();
  // Map Prisma dates to ISO strings for client compatibility
  const attempts = rawAttempts.map((r: any) => ({
    ...r,
    attemptedAt: r.startedAt?.toISOString() || new Date().toISOString(),
  }));

  return <PageClient courses={courses} lessons={lessons} attempts={attempts} />;
}
