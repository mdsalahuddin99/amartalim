export interface BookChapter {
  title: string;
  content: string;
  image?: string;
}

export interface BookRecord {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: "ই-বুক" | "জীবনী" | string;
  subcategory: string;
  description: string;
  pages: number;
  rating: number;
  readers: number;
  publishDate: string;
  language: string;
  isFree: boolean;
  status?: "draft" | "published";
  chapters: BookChapter[];
  createdAt?: string;
  updatedAt?: string;
}
