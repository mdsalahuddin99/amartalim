import { Metadata } from "next";
import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import PageClient from "./PageClient"; // Force TS server reload

export const metadata: Metadata = {
  title: "হেডার ও ফুটার | অ্যাডমিন | Amar Talim",
};

export default async function HeaderFooterPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return <PageClient />;
}
