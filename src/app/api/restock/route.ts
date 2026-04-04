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

    const [restockQueue, total] = await Promise.all([
      prisma.restockQueue.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        include: { product: true },
        orderBy: { priority: "desc" }, // Adjust if you want different sorting
      }),
      prisma.restockQueue.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      restockQueue,
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

    // Upsert so we don't have dupes for the same product in restock queue
    const restockItem = await prisma.restockQueue.upsert({
      where: {
        productId,
      },
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
