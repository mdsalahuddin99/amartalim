import { prisma } from "../db/prisma";

export const getAllCommentsForAdmin = async () => {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, image: true }
      },
      blog: {
        select: { title: true, slug: true }
      }
    }
  });

  return comments.map(c => ({
    id: c.id,
    body: c.content,
    blogId: c.blogId,
    authorName: c.user?.name || "Unknown",
    authorAvatar: c.user?.image || null,
    parentId: c.parentId,
    createdAt: c.createdAt.toISOString(),
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
    status: c.status,
    blogTitle: c.blog?.title || "",
    blogSlug: c.blog?.slug || ""
  }));
};
