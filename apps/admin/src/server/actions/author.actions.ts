"use server";

import { authorApplicationSchema, reviewNoteSchema, authorAdminCreateSchema, authorAdminUpdateSchema, type AuthorAdminCreateInput } from "@/lib/validators/author";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { Author } from "@prisma/client";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function applyAsAuthor(
  input: unknown,
): Promise<ActionResult<Author>> {
  const parsed = authorApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "ফর্মে ভুল আছে",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    const d = parsed.data;
    
    // Auto-generate a slug from the name
    const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const author = await prisma.author.create({
      data: {
        name: d.name,
        slug: slug,
        email: d.email,
        phone: d.phone ?? null,
        avatar: d.avatar ?? null,
        bio: d.bio,
        shortBio: d.shortBio ?? null,
        expertise: d.expertise,
        facebook: d.facebook ?? null,
        twitter: d.twitter ?? null,
        website: d.website ?? null,
        status: "PENDING",
      }
    });
    return { ok: true, data: author };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "ত্রুটি" };
  }
}

export async function approveAuthor(id: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  await prisma.author.update({
    where: { id },
    data: { status: "APPROVED", reviewedBy: session.user.id },
  });
  return { ok: true };
}

export async function rejectAuthor(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  const parsed = reviewNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "কারণ লিখুন" };
  }
  
  await prisma.author.update({
    where: { id },
    data: { status: "REJECTED", reviewNote: parsed.data.reviewNote, reviewedBy: session.user.id },
  });
  return { ok: true };
}

export async function suspendAuthor(id: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  await prisma.author.update({
    where: { id },
    data: { status: "SUSPENDED", reviewedBy: session.user.id },
  });
  return { ok: true };
}

export async function createAuthorAdmin(input: unknown): Promise<ActionResult<Author>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  const parsed = authorAdminCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const d = parsed.data as AuthorAdminCreateInput;
    const author = await prisma.author.create({
      data: {
        name: d.name,
        slug: d.slug,
        email: d.email,
        phone: d.phone ?? null,
        avatar: d.avatar ?? null,
        bio: d.bio,
        shortBio: d.shortBio ?? null,
        expertise: d.expertise ?? [],
        facebook: d.facebook ?? null,
        twitter: d.twitter ?? null,
        website: d.website ?? null,
        status: "APPROVED",
        reviewedBy: session.user.id,
      },
    });
    return { ok: true, data: author };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { ok: false, error: "Email or Slug already exists." };
    }
    return { ok: false, error: err.message || "Failed to create author" };
  }
}

export async function updateAuthorAdmin(id: string, input: unknown): Promise<ActionResult<Author>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  const parsed = authorAdminUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Validation failed" };
  }

  try {
    const author = await prisma.author.update({
      where: { id },
      data: parsed.data,
    });
    return { ok: true, data: author };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { ok: false, error: "Email or Slug already exists." };
    }
    return { ok: false, error: err.message || "Failed to update author" };
  }
}

export async function deleteAuthorAdmin(id: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    await prisma.author.delete({ where: { id } });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to delete author" };
  }
}

