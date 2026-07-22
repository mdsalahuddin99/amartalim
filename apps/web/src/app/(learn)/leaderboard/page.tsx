import { Metadata } from "next";
import PageClient from "./PageClient";
import { getLeaderboard } from "@/server/queries/user.queries";

export const metadata: Metadata = {
  title: "Leaderboard | Amar Talim",
};

export default async function Page() {
  const leaderboard = await getLeaderboard(50);
  return <PageClient initialRows={leaderboard} />;
}
