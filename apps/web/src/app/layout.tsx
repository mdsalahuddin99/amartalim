import "@/index.css";
import { Providers } from "@/components/Providers";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "আমার তালিম — বাংলা ব্লগ ও জ্ঞানভাণ্ডার",
    template: "%s | আমার তালিম",
  },
  description: "আরবী ভাষা শিক্ষা, কুরআন, AI, ফ্রিল্যান্সিং, ক্যারিয়ার ও ডিজিটাল মার্কেটিং নিয়ে বাংলা ভাষায় গভীর গবেষণাভিত্তিক ব্লগ ও আর্টিকেল।",
  keywords: ["Amar Talim", "আমার তালিম", "বাংলা ব্লগ", "Islamic Blog", "Freelancing Bangladesh", "Arabic Language Learning", "Quran Learning", "AI in Bengali", "Digital Marketing Bengali"],
  authors: [{ name: "Amar Talim Team", url: "https://amar-talim.com" }],
  openGraph: {
    title: "আমার তালিম — বাংলা ব্লগ ও জ্ঞানভাণ্ডার",
    description: "আরবী ভাষা শিক্ষা, কুরআন, AI, ফ্রিল্যান্সিং, ক্যারিয়ার ও ডিজিটাল মার্কেটিং নিয়ে বাংলা ভাষায় গভীর গবেষণাভিত্তিক ব্লগ ও আর্টিকেল।",
    url: "https://amar-talim.com",
    siteName: "আমার তালিম",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "আমার তালিম",
    description: "আরবী ভাষা শিক্ষা, কুরআন, AI, ফ্রিল্যান্সিং, ক্যারিয়ার ও ডিজিটাল মার্কেটিং নিয়ে বাংলা ভাষায় গভীর গবেষণাভিত্তিক ব্লগ ও আর্টিকেল।",
  },
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
