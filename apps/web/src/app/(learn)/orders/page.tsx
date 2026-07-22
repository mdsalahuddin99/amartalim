import { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./PageClient";
import { getUserOrders } from "@/server/actions/order.actions";

export const metadata: Metadata = {
  title: "Orders | Amar Talim",
};

export default async function Page() {
  const res = await getUserOrders();
  const orders = res.ok ? res.data : [];

  return (
    <Suspense>
      <PageClient initialOrders={orders as any[]} />
    </Suspense>
  );
}
