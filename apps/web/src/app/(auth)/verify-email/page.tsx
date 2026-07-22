import { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "Verify Email | Amar Talim",
};

export default function Page() {
  return (
    <Suspense>
      <PageClient />
    </Suspense>
  );
}
