import { Metadata } from "next";
import PageClient from "./PageClient";
import { getBooks } from "@/server/actions/book.actions";

export const metadata: Metadata = {
  title: "Library | Amar Talim",
};

export default async function Page() {
  const res = await getBooks();
  const books = res.ok && res.data ? res.data : [];
  return <PageClient initialBooks={books as any} />;
}
