export type AuthorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface Author {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio: string;
  shortBio?: string;
  expertise: string[];
  facebook?: string;
  twitter?: string;
  website?: string;
  status: AuthorStatus;
  reviewNote?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const EXPERTISE_OPTIONS = [
  "আরবি সাহিত্য",
  "নাহু-সরফ",
  "বালাগাত",
  "তাফসীর",
  "হাদীস",
  "ফিকহ",
  "ইসলামিক ইতিহাস",
] as const;
