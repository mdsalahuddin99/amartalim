import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { getUserBlogsAction } from "@/server/actions/user-blog.actions";
import UserBlogs from "@/components/dashboard/UserBlogs";
import AuthorLayout from "@/components/layout/AuthorLayout";

export default async function DashboardBlogsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Check if they are an author
  const authorProfile = await prisma.author.findUnique({
    where: { email: session.user.email! },
  });

  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    if (!authorProfile || authorProfile.status !== "APPROVED") {
      redirect("/dashboard");
    }
  }

  const posts = await getUserBlogsAction();
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });
  
  // Since they are the user, we only provide their author profile
  const authors = authorProfile ? [authorProfile] : [];

  return (
    <AuthorLayout isAuthor={true} isAdmin={session.user.role === "ADMIN"}>
      <div className="space-y-6">
        <UserBlogs
          initialPosts={posts}
          initialCategories={categories}
          authors={authors}
        />
      </div>
    </AuthorLayout>
  );
}
