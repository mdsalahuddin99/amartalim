import { Metadata } from "next";
import PageClient from "./PageClient";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ইন্সট্রাক্টর আবেদন | Amar Talim",
};

export default async function InstructorApplyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/dashboard/login?from=/dashboard/apply/instructor");
  }

  const applications = await prisma.roleApplication.findMany({
    where: { userId: session.user.id, role: "INSTRUCTOR" },
    orderBy: { createdAt: "desc" }
  });

  return <PageClient initialApplications={applications} />;
}
