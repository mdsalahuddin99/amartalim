import { Metadata } from "next";
import PageClient from "./PageClient";
import { getAllCommentsForAdmin } from "@/server/queries/comment.queries";

export const metadata: Metadata = {
  title: "Comments | Amar Talim",
};

export default async function Page() {
  const comments = await getAllCommentsForAdmin();
  return <PageClient comments={comments} />;
}
