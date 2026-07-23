import * as React from "react";
import { Metadata } from "next";
import DashboardLoginPage from "./PageClient";

export const metadata: Metadata = {
  title: "শিক্ষার্থী লগইন | Amar Talim",
};

export default function Page() {
  return (
    <React.Suspense fallback={<div />}>
      <DashboardLoginPage />
    </React.Suspense>
  );
}
