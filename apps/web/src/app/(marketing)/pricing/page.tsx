import { Metadata } from "next";
import PageClient from "./PageClient";
import { getPricingContent } from "@/server/queries/pricing.queries";

export const metadata: Metadata = {
  title: "Pricing | Amar Talim",
};

export default async function Page() {
  const content = await getPricingContent();
  return <PageClient initialContent={content as any} />;
}
