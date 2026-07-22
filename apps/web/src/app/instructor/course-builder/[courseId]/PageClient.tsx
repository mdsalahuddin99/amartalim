"use client";

import { useParams } from "@/lib/navigation";
import InstructorLayout from "@/components/instructor/InstructorLayout";
import CourseBuilder from "@/components/admin/CourseBuilder";

const Page = () => {
  const { courseId } = useParams<{ courseId: string }>();
  return (
    <InstructorLayout>
      <CourseBuilder courseId={courseId || ""} backHref="/instructor/courses" />
    </InstructorLayout>
  );
};
export default Page;
