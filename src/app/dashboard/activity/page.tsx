
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import ActivityClient from "./components/activity-client";

export const metadata = {
  title: "Activity Log | Smart Inventory Manager",
  description: "View system activity logs",
};

export default async function ActivityPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <ActivityClient />;
}