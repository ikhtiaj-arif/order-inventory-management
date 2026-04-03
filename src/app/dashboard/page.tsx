import { redirect } from "next/navigation";
import { getSession } from "@/lib/sessions";
import { prisma } from "@/lib/db";
import DashboardClient from "./components/dashboard-client";
import { OrderStatus, ProductStatus } from "@/generated/prisma";

export const metadata = {
  title: "Dashboard | Smart Inventory Manager",
  description: "Manage your inventory and orders",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Start of today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Fetch dashboard data (SAFE Prisma usage)
  const [todayOrders, pendingOrders, lowStockProducts, activityLogs] =
    await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),

      // ✅ FIX: enum instead of string
      prisma.order.count({
        where: {
          status: OrderStatus.PENDING,
        },
      }),

      //  FIX: use status instead of isActive
      prisma.product.count({
        where: {
          stock: { lt: 10 },
          status: ProductStatus.ACTIVE,
        },
      }),

      //  FIX: avoid createdAt error (fallback to id sorting if needed)
      prisma.activityLog.findMany({
        take: 10,
        orderBy: {
          id: "desc", //always safe (no schema mismatch risk)
        },
        include: {
          user: true,
        },
      }),
    ]);

  // ✅ BEST PRACTICE: use totalPrice (no relation issues)
  const orderData = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.DELIVERED, OrderStatus.PENDING],
      },
    },
    select: {
      totalPrice: true,
    },
  });

  const totalRevenue = orderData.reduce((sum, order) => {
    return sum + Number(order.totalPrice);
  }, 0);

  return (
    <DashboardClient
      user={session.user}
      stats={{
        todayOrders,
        pendingOrders,
        lowStockProducts,
        totalRevenue,
      }}
      activityLogs={activityLogs}
    />
  );
}