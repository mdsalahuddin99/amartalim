import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const blogs = await prisma.blog.findMany({ select: { slug: true, title: true } });
  return NextResponse.json(blogs);
}
