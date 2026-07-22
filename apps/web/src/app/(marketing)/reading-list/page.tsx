import { Metadata } from "next";
import PageClient from "./PageClient";
import { getAllBlogs } from "@/server/queries/blog.queries";

export const metadata: Metadata = {
  title: "ReadingList | Amar Talim",
};

export default async function Page() {
  const blogs = await getAllBlogs();
  return <PageClient initialBlogs={blogs} />;
}
