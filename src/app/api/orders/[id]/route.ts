import { prisma } from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { logActivity } from "@/lib/activity-logger";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === status) {
       return NextResponse.json({ error: "Order is already in this status" }, { status: 400 });
    }

    const isCancelling = status === "CANCELLED" && order.status !== "CANCELLED";

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      if (isCancelling) {
        for (const item of order.items) {
          const newStock = item.product.stock + item.quantity;
          let newStatus = item.product.status;
          
          if (newStatus === "OUT_OF_STOCK" && newStock > 0) {
            newStatus = "ACTIVE";
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock, status: newStatus }
          });
          
          const pq = await tx.restockQueue.findUnique({ where: { productId: item.productId } });
          if (pq && newStock > item.product.minStockThreshold) {
              await tx.restockQueue.delete({ where: { productId: item.productId } });
          } else if (pq) {
              await tx.restockQueue.update({
                  where: { productId: item.productId },
                  data: { currentStock: newStock }
              });
          }
        }
      }

      return updated;
    });

    await logActivity({
      userId: session.user.id as string,
      action: isCancelling ? "CANCEL_ORDER" : "UPDATE_ORDER_STATUS",
      entityType: "ORDER",
      entityId: order.id,
      details: { message: `Order ${order.orderNumber} status changed to ${status}` },
    });

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    console.error("Orders PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 },
    );
  }
}
