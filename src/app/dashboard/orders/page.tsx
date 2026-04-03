import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import OrdersClient from "./components/orders-client";

export const metadata = {
  title: "Orders | Smart Inventory Manager",
  description: "Manage customer orders",
};

export default async function OrdersPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <OrdersClient />;
}
