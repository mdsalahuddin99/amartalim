import { Metadata } from "next";
import PageClient from "./PageClient";
import { getBookCategories } from "@/server/actions/book-category.actions";

export const metadata: Metadata = {
  title: "বইয়ের ক্যাটাগরি | Amar Talim",
};

export default async function Page() {
  const { data: categories = [] } = await getBookCategories();
  
  return <PageClient initialCategories={categories} />;
}
