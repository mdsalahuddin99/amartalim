import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "Account | Amar Talim",
};

export default function Page() {
  return <PageClient />;
}
