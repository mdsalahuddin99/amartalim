import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "FAQ | Amar Talim",
  description: "Find answers to frequently asked questions about Amar Talim, our courses, and our platform.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | Amar Talim",
    description: "Find answers to frequently asked questions about Amar Talim, our courses, and our platform.",
    url: "/faq",
    type: "website",
  },
};

export default function Page() {
  return <PageClient />;
}
