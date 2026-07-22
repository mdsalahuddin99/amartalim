import { Metadata } from "next";
import PageClient from "./PageClient";
import { getBooks } from "@/server/actions/book.actions";
import { getBookCategories } from "@/server/actions/book-category.actions";

export const metadata: Metadata = {
  title: "Books | Amar Talim",
};

export default async function Page() {
  const [booksRes, catsRes] = await Promise.all([
    getBooks(),
    getBookCategories()
  ]);

  return <PageClient initialBooks={booksRes.data || []} categories={catsRes.data || []} />;
}
