import { prisma } from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { CategorySchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const validatedData = CategorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        userId: session.user.id as string,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Category POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 400 },
    );
  }
}
