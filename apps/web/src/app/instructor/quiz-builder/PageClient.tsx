"use client";

import InstructorLayout from "@/components/instructor/InstructorLayout";
import QuizBuilder from "@/components/instructor/QuizBuilder";
import { instructorCourseIds } from "@/components/instructor/InstructorSections";

const Page = () => (
  <InstructorLayout>
    <QuizBuilder allowedCourseIds={instructorCourseIds} />
  </InstructorLayout>
);
export default Page;
