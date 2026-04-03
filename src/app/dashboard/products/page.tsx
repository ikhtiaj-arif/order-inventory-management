import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ProductsClient from "./components/products-client";

export const metadata = {
  title: "Products | Smart Inventory Manager",
  description: "Manage products and inventory",
};

export default async function ProductsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <ProductsClient />;
}
