import { prisma } from "@/lib/db";
import { getSession } from "@/lib/sessions";
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

    // Basic calculation for totalPrice
    let totalPrice = 0;
    const orderItems = items.map((item: any) => {
      const subtotal = item.quantity * item.unitPrice;
      totalPrice += subtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: subtotal,
      };
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerName,
        totalPrice,
        userId: session.user.id as string,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 400 },
    );
  }
}
