"use client";

import InstructorLayout from "@/components/instructor/InstructorLayout";
import LessonBuilder from "@/components/instructor/LessonBuilder";
import { instructorCourseIds } from "@/components/instructor/InstructorSections";

const Page = () => (
  <InstructorLayout>
    <LessonBuilder allowedCourseIds={instructorCourseIds} />
  </InstructorLayout>
);
export default Page;
