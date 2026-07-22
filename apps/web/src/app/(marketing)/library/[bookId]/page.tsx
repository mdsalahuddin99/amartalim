import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageClient from "./PageClient";
import { getBook } from "@/server/actions/book.actions";

export async function generateMetadata({ params }: { params: { bookId: string } }): Promise<Metadata> {
  const res = await getBook(params.bookId);
  if (!res.ok || !res.data) return { title: "Not Found | Amar Talim" };
  
  const book = res.data;
  const title = `${book.title} | Amar Talim Library`;
  const description = book.description ? book.description.substring(0, 160) : `Read ${book.title} by ${book.author}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amar-talim.com";
  const url = `${siteUrl}/library/${params.bookId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "book",
      images: book.cover ? [book.cover] : [],
    }
  };
}

export default async function Page({ params }: { params: { bookId: string } }) {
  const res = await getBook(params.bookId);
  if (!res.ok || !res.data) return notFound();
  
  const book = res.data;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "description": book.description || `Read ${book.title} by ${book.author}`,
    "image": book.cover ? [book.cover] : [],
    "inLanguage": book.language || "bn"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageClient initialBook={book as any} />
    </>
  );
}
