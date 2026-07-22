import { Metadata } from "next";
import PageClient from "./PageClient";
import { getDashboardStats, getRecentActivity } from "@/server/actions/dashboard";

export const metadata: Metadata = {
  title: "Admin | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const stats = await getDashboardStats();
  const activity = await getRecentActivity();
  
  return <PageClient stats={stats} activity={activity} />;
}
