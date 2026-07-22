import { Metadata } from "next";
import PageClient from "./PageClient";
import { getDashboardData } from "@/server/queries/user.queries";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export const metadata: Metadata = {
  title: "Dashboard | Amar Talim",
};

export default async function Page() {
  // The server no longer gates on NextAuth session for the student dashboard.
  // Authentication is handled client-side via the user-panel localStorage store.
  // We still pre-fetch data when a NextAuth session is present (e.g. a regular student).
  const session = await auth();

  let dashboardData = { enrollments: [], progress: [], attempts: [] };
  const roles = { isAuthor: false, isInstructor: false, isMufti: false };

  // Only prefetch if this is a regular student logged in via NextAuth
  // (Admins who are browsing /dashboard will be shown the login form client-side)
  if (session?.user && session.user.role !== "ADMIN") {
    dashboardData = await getDashboardData(session.user.id);

    const applications = await prisma.roleApplication.findMany({
      where: { userId: session.user.id },
      select: { role: true, status: true },
    });

    const appMap = Object.fromEntries(applications.map((a) => [a.role, a.status]));

    const authorProfile = await prisma.author.findUnique({
      where: { email: session.user.email! },
      select: { status: true },
    });

    roles.isInstructor =
      session.user.role === "INSTRUCTOR" ||
      appMap["INSTRUCTOR"] === "APPROVED";

    roles.isAuthor =
      (!!authorProfile && authorProfile.status === "APPROVED") ||
      appMap["AUTHOR"] === "APPROVED";

    roles.isMufti = appMap["MUFTI"] === "APPROVED";
  }

  return <PageClient initialData={{ ...dashboardData, ...roles } as any} />;
}
