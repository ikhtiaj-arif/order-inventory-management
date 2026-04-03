import { hashedPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: true, message: "Demo account already exists" },
        { status: 200 },
      );
    }

    const hashPassword = await hashedPassword("Demo123!");

    const user = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
        password: hashPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      { success: true, message: "Demo account created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Demo account creation error:", error);
    return NextResponse.json(
      { error: "Failed to create demo account" },
      { status: 500 },
    );
  }
}
