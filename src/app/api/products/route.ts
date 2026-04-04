import { logActivity } from "@/lib/activity-logger";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { ProductSchema } from "@/lib/validators";
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[v0] Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const validatedData = ProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        userId: session.user.id as string,
      },
      include: { category: true },
    });

    await logActivity({
      userId: session.user.id as string,
      action: "CREATE_PRODUCT",
      entityType: "PRODUCT",
      entityId: product.id,
      details: { message: `Created product: ${product.name}` },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("[v0] Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 400 },
    );
  }
}
