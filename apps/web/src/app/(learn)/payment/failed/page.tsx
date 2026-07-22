import { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "পেমেন্ট ব্যর্থ হয়েছে · আমার তালিম",
  description: "আপনার পেমেন্ট সম্পন্ন হয়নি।",
};

export default function Page() {
  return (
    <Suspense>
      <PageClient />
    </Suspense>
  );
}
