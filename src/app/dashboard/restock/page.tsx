
import { redirect } from "next/navigation";
import RestockClient from "./components/restock-client";
import { getSession } from "@/lib/sessions";

export const metadata = {
  title: "Restock Queue | Smart Inventory Manager",
  description: "Manage restock requests",
};

export default async function RestockPage() {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return <RestockClient />;
}
