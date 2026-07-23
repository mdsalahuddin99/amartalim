import "@/index.css";
import { Providers } from "@/components/Providers";
import React, { Suspense } from "react";

export const metadata = {
  title: "আমার তালিম — বাংলা ব্লগ ও জ্ঞানভাণ্ডার",
  description: "আরবী ভাষা শিক্ষা, কুরআন, AI, ফ্রিল্যান্সিং, ক্যারিয়ার ও ডিজিটাল মার্কেটিং নিয়ে বাংলা ভাষায় গভীর গবেষণাভিত্তিক ব্লগ ও আর্টিকেল।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Providers
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <React.Suspense fallback={null}>
            {children}
          </React.Suspense>
        </Providers>
      </body>
    </html>
  );
}
