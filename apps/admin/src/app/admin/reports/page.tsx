import { Metadata } from "next";
import PageClient from "./PageClient";
import { getReportStats } from "@/server/actions/reports";

export const metadata: Metadata = {
  title: "Reports | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getReportStats();
  return <PageClient data={data} />;
}
