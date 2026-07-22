import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "Contact | Amar Talim",
  description: "Get in touch with the Amar Talim team for inquiries, support, or feedback.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Amar Talim",
    description: "Get in touch with the Amar Talim team for inquiries, support, or feedback.",
    url: "/contact",
    type: "website",
  },
};

export default function Page() {
  return <PageClient />;
}
