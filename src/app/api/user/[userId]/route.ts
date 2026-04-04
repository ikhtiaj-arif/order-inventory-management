import { prisma } from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { NextRequest, NextResponse } from "next/server";
import { hashedPassword } from "@/lib/auth";

type Params = {
  params: Promise<{
    userId: string;
  }>;
};

export async function GET(req: NextRequest, segmentData: Params) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await segmentData.params;
    
    // Users can only view their own profile, unless they are ADMIN
    if (session.user.role !== "ADMIN" && session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, segmentData: Params) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await segmentData.params;

    if (session.user.role !== "ADMIN" && session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, password, role } = body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (password) updateData.password = await hashedPassword(password);
    
    // Only ADMIN can change roles
    if (role && session.user.role === "ADMIN") {
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("User PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, segmentData: Params) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await segmentData.params;

    // Prevent self deletion
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("User DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 400 },
    );
  }
}
