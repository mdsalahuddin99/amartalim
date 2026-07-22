import { prisma } from "../db/prisma";
import { auth } from "../auth/auth";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(courseId: string) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  try {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      revalidatePath("/wishlist");
      return { ok: true, active: false };
    }

    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    });
    revalidatePath("/wishlist");
    return { ok: true, active: true };
  } catch (error) {
    return { ok: false, error: "Failed to toggle wishlist" };
  }
}

export async function getUserWishlist() {
  const session = await auth();
  if (!session?.user) return { ok: false, data: [] };

  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            category: true,
            instructor: { select: { id: true, name: true, image: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return { ok: true, data: items };
  } catch (error) {
    return { ok: false, data: [] };
  }
}

export async function checkWishlistStatus(courseId: string) {
  const session = await auth();
  if (!session?.user) return { active: false };

  try {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });
    return { active: !!existing };
  } catch (error) {
    return { active: false };
  }
}
