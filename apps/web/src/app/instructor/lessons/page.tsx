import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "Lessons | Amar Talim",
};

export default function Page() {
  return <PageClient />;
}
