import { Metadata } from "next";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";
import PageClient from "./PageClient";


export const metadata: Metadata = {
  title: "আবেদনসমূহ | অ্যাডমিন | Amar Talim",
};

export default async function AdminApplicationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const applications = await prisma.roleApplication.findMany({
    include: {
      user: {
        select: {
          email: true,
          image: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return <PageClient initialApplications={applications} />;
}
