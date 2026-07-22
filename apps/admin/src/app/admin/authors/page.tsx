import { Metadata } from "next";
import PageClient from "./PageClient";
import { getAllAuthorsForAdmin } from "@/server/queries/author.queries";

export const metadata: Metadata = {
  title: "Authors | Amar Talim",
};

export default async function Page() {
  const authors = await getAllAuthorsForAdmin();
  return <PageClient authors={authors} />;
}
