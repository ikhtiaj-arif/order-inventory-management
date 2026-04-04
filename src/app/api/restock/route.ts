import { prisma } from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [restockQueues, total] = await Promise.all([
      prisma.restockQueue.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        include: { product: true },
        orderBy: { currentStock: "asc" },
      }),
      prisma.restockQueue.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      restockQueues,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Restock GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restock queue" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, currentStock, priority } = body;

    if (!productId || currentStock === undefined) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const restockItem = await prisma.restockQueue.upsert({
      where: { productId },
      update: {
        currentStock,
        priority: priority || "MEDIUM",
      },
      create: {
        productId,
        currentStock,
        priority: priority || "MEDIUM",
        userId: session.user.id as string,
      },
    });

    return NextResponse.json(restockItem, { status: 201 });
  } catch (error: any) {
    console.error("Restock POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add to restock queue" },
      { status: 400 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action, quantity } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Get the restock item first
    const restockItem = await prisma.restockQueue.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!restockItem) {
      return NextResponse.json({ error: "Restock item not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      const addQty = quantity ?? 1;
      // Increase product stock and remove from queue
      await prisma.$transaction([
        prisma.product.update({
          where: { id: restockItem.productId },
          data: { stock: { increment: addQty } },
        }),
        prisma.restockQueue.delete({ where: { id } }),
      ]);
      return NextResponse.json({ message: "Restock approved and stock updated" });
    } else if (action === "REJECT") {
      // Just remove from queue
      await prisma.restockQueue.delete({ where: { id } });
      return NextResponse.json({ message: "Restock request rejected" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Restock PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process restock action" },
      { status: 400 },
    );
  }
}
