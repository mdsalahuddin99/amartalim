import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import MuftiLayout from "@/components/layout/MuftiLayout";
import AdminQaPosts from "@/components/admin/AdminQaPosts";
import MuftiQaPosts from "@/components/mufti/MuftiQaPosts";

export default async function MuftiDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Check if they are a mufti
  const applications = await prisma.roleApplication.findMany({
    where: { userId: session.user.id },
    select: { role: true, status: true },
  });
  const appMap = Object.fromEntries(applications.map((a) => [a.role, a.status]));
  const isMufti = appMap["MUFTI"] === "APPROVED";
  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && !isMufti) {
    redirect("/dashboard");
  }

  // Fetch Mufti profile for the current user
  let mufti = null;
  if (session.user.email) {
    mufti = await prisma.mufti.findUnique({
      where: { email: session.user.email },
    });
  }

  // Fetch posts: if admin, fetch all. If mufti, fetch assigned to this mufti
  const postsWhere: any = {};
  if (!isAdmin && mufti) {
    postsWhere.muftiId = mufti.id;
  } else if (!isAdmin && !mufti) {
     // If they are approved but no mufti profile created yet
     postsWhere.muftiId = "none";
  }

  const posts = await prisma.qaPost.findMany({
    where: postsWhere,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      mufti: true,
      asker: { select: { name: true, image: true } },
    },
  });

  const categories = await prisma.qaCategory.findMany({ orderBy: { createdAt: "asc" } });
  const allMuftis = await prisma.mufti.findMany({ orderBy: { createdAt: "desc" } });

  const formattedPosts = posts.map((p) => ({
    ...p,
    tags: p.tags || [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() || null,
  }));

  return (
    <MuftiLayout isMufti={true} isAdmin={session.user.role === "ADMIN"}>
      {isAdmin ? (
        <AdminQaPosts 
          initialPosts={formattedPosts} 
          categories={categories as any} 
          muftis={allMuftis} 
        />
      ) : (
        <MuftiQaPosts 
          initialPosts={formattedPosts} 
          categories={categories as any} 
          currentMufti={mufti!} 
        />
      )}
    </MuftiLayout>
  );
}
