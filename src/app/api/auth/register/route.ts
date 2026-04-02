import { UserRole } from "@/generated/prisma/enums";
import { generateToken, hashedPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    // validate required fields

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Name, password & email not valid!",
        },
        { status: 400 },
      );
    }
    //check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists!",
        },
        { status: 409 },
      );
    }

    //create user
    const hashPassword = await hashedPassword(password);

    // First user will be admin by default
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.USER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role,
      },
    });

    //generate token
    const token = generateToken(user.id);

    //create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });

    //set token to cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      //when in production will be https else http
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("registration failed", error);
    return NextResponse.json(
      {
        error: "Internal server error, something went wrong!",
      },
      { status: 500 },
    );
  }
}
