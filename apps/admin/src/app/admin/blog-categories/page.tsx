import { Metadata } from "next";
import PageClient from "./PageClient";
import { getBlogCategories } from "@/server/actions/blog-category.actions";

export const metadata: Metadata = {
  title: "BlogCategories | Amar Talim",
};

export default async function Page() {
  const { data: categories = [] } = await getBlogCategories();
  
  return <PageClient initialCategories={categories} />;
}
