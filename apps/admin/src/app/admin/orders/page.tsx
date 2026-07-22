import { Metadata } from "next";
import PageClient from "./PageClient";
import { getAdminOrders } from "@/server/actions/admin-orders";

export const metadata: Metadata = {
  title: "Orders | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const orders = await getAdminOrders();
  return <PageClient initialOrders={orders} />;
}
