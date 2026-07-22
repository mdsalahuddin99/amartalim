import { Metadata } from "next";
import PageClient from "./PageClient";
import { getUserWishlist } from "@/server/actions/wishlist.actions";

export const metadata: Metadata = {
  title: "Wishlist | Amar Talim",
};

export default async function Page() {
  const res = await getUserWishlist();
  const wishlist = res?.ok ? res.data : [];

  return <PageClient initialItems={wishlist as any[]} />;
}
