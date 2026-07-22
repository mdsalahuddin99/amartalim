import { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "পেমেন্ট সফল হয়েছে · আমার তালিম",
  description: "আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।",
};

export default function Page() {
  return (
    <Suspense>
      <PageClient />
    </Suspense>
  );
}
