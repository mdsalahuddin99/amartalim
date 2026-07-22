import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "Settings | Amar Talim",
};

export default function Page() {
  return <PageClient />;
}
