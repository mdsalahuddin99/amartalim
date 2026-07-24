import { Metadata } from "next";
import PageClient from "./PageClient";
import { prisma } from "@/server/db/prisma";

export const metadata: Metadata = {
  title: "Categories | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const dbCategories = await prisma.courseCategory.findMany({
    include: {
      courses: true,
    }
  });

  const categories = dbCategories.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || "",
    image: c.image || "",
    parentId: "", // the schema currently doesn't have parentId, so they are all root
    courseCount: c.courses.length,
  }));

  return <PageClient initialCategories={categories} />;
}
