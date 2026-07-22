import { Metadata } from "next";
import PageClient from "./PageClient";
import { getAllBlogsForAdmin } from "@/server/queries/blog.queries";
import { getAllAuthorsForAdmin } from "@/server/queries/author.queries";
import { getBlogCategories } from "@/server/actions/blog-category.actions";

export const metadata: Metadata = {
  title: "Blogs | Amar Talim",
};

export default async function Page() {
  const blogs = await getAllBlogsForAdmin();
  const authors = await getAllAuthorsForAdmin();
  const { data: categories = [] } = await getBlogCategories();
  
  return <PageClient blogs={blogs} categories={categories} authors={authors} />;
}
