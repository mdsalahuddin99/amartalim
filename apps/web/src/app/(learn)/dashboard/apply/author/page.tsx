import { Metadata } from "next";
import PageClient from "./PageClient"; // Trigger TS server refresh
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "লেখক আবেদন | Amar Talim",
};

export default async function AuthorApplyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/dashboard/login?from=/dashboard/apply/author");
  }

  const applications = await prisma.roleApplication.findMany({
    where: { userId: session.user.id, role: "AUTHOR" },
    orderBy: { createdAt: "desc" }
  });

  return <PageClient initialApplications={applications} />;
}
