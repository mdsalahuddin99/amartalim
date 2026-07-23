import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPublishedBlogs } from "@/server/queries/blog.queries";

export const metadata: Metadata = {
  title: "ReadingList | Amar Talim",
};

export default async function Page() {
  const blogs = await getPublishedBlogs();
  return <PageClient initialBlogs={blogs} />;
}
