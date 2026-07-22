import { Metadata } from "next";
import PageClient from "./PageClient";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "মুফতি আবেদন | Amar Talim",
};

export default async function MuftiApplyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/dashboard/login?from=/dashboard/apply/mufti");
  }

  const applications = await prisma.roleApplication.findMany({
    where: { userId: session.user.id, role: "MUFTI" },
    orderBy: { createdAt: "desc" }
  });

  return <PageClient initialApplications={applications} />;
}
