import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "About | Amar Talim",
  description: "Learn more about Amar Talim, our mission, and the team behind our educational platform.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Amar Talim",
    description: "Learn more about Amar Talim, our mission, and the team behind our educational platform.",
    url: "/about",
    type: "website",
  },
};

export default function Page() {
  return <PageClient />;
}
