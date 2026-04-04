
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardClient from "./components/dashboard-client";
import { getSession } from "@/lib/sessions";

export const metadata = {
  title: "Dashboard | Smart Inventory Manager",
  description: "Manage your inventory and orders",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch dashboard data
  const [todayOrders, pendingOrders, lowStockProducts, totalRevenue, activityLogs] =
    await Promise.all([
      prisma.order.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.count({
        where: {
          userId: session.user.id,
          status: "PENDING",
        },
      }),
      prisma.product.count({
        where: {
          userId: session.user.id,
          stock: { lt: 10 },
          status: "ACTIVE",
        },
      }),
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
        },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.activityLog.findMany({
        where: { userId: session.user.id },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
    ]);

  return (
    <DashboardClient
      user={session.user}
      stats={{
        todayOrders,
        pendingOrders,
        lowStockProducts,
        totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
      }}
      activityLogs={activityLogs}
    />
  );
}
