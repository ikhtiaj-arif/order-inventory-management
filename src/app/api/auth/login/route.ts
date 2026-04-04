import { generateToken, hashedPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    // validate required fields

    if ( !email || !password) {
      return NextResponse.json(
        {
          error: " password & email not valid!",
        },
        { status: 400 },
      );
    }
    //check existing user
    const userFromDB = await prisma.user.findUnique({
      where: { email },
    });
    if (!userFromDB) {
      return NextResponse.json(
        {
          error: "Invalid Credentials!",
        },
        { status: 401 },
      );
    }

    //check password valid
    const isValidPassword =  await verifyPassword(password, userFromDB.password as string)
   if (!isValidPassword) {
      return NextResponse.json(
        {
          error: "Invalid Credentials!",
        },
        { status: 401 },
      );
    }
  


    
    //generate token
    const token = generateToken(userFromDB.id);

    //create response
    const response = NextResponse.json({
      user: {
        id: userFromDB.id,
        name: userFromDB.name,
        email: userFromDB.email,
        role: userFromDB.role,
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
    console.error("Login failed", error);
    return NextResponse.json(
      {
        error: "Internal server error, something went wrong!",
      },
      { status: 500 },
    );
  }
}
