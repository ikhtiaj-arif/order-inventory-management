import { prisma } from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { logActivity } from "@/lib/activity-logger";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerName, items } = body;

    if (!customerName || !items || !items.length) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const productIds = items.map((item: any) => item.productId);
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
      return NextResponse.json({ error: "This product is already added to the order." }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, userId: session.user.id },
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

    let totalPrice = 0;
    const orderItemsToCreate: any[] = [];

    for (const item of items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (product.status === "INACTIVE") {
        return NextResponse.json({ error: `This product is currently unavailable: ${product.name}` }, { status: 400 });
      }
      if (item.quantity > product.stock) {
        return NextResponse.json({ error: `Only ${product.stock} items available in stock for ${product.name}` }, { status: 400 });
      }

      const subtotal = item.quantity * Number(product.price);
      totalPrice += subtotal;

      orderItemsToCreate.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: subtotal,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          customerName,
          totalPrice,
          userId: session.user.id as string,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: { items: true },
      });

      for (const item of items) {
        const product = productsMap.get(item.productId)!;
        const newStock = product.stock - item.quantity;
        let newStatus = product.status;
        
        if (newStock <= 0) {
          newStatus = "OUT_OF_STOCK";
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock, status: newStatus }
        });

        if (newStock <= product.minStockThreshold) {
          await tx.restockQueue.upsert({
            where: { productId: product.id },
            update: { currentStock: newStock },
            create: {
              productId: product.id,
              currentStock: newStock,
              priority: newStock <= 0 ? "HIGH" : "MEDIUM",
              userId: session.user.id as string,
            }
          });
        }
      }
      return order;
    });

    await logActivity({
      userId: session.user.id as string,
      action: "CREATE_ORDER",
      entityType: "ORDER",
      entityId: result.id,
      details: { message: `Created order: ${result.orderNumber} for ${customerName}` },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 400 },
    );
  }
}
