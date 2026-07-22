import { Metadata } from "next";
import PageClient from "./PageClient";
import { getSettings } from "@/server/actions/settings";

export const metadata: Metadata = {
  title: "Settings | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getSettings();
  return <PageClient settings={settings} />;
}
