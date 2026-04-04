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
    const limit = parseInt(searchParams.get("limit") || "50");

    const logs = await prisma.activityLog.findMany({
      where: { userId: session.user.id },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Activity GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}
