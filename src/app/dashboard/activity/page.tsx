
import { prisma } from "@/lib/db";
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

  // Fetch activity logs safely
  const logs = await prisma.activityLog.findMany({
    take: 50,

    //  SAFE fallback (avoids createdAt type error)
    orderBy: {
      id: "desc",
    },

    include: {
      user: true,
    },
  });

  return <ActivityClient initialLogs={logs} />;
}