"use server";

import { hashedPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/sessions";
// import { userSchema } from "@/lib/validators";

import { userSchema } from "@/lib/validators";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  try {
    const { email, password } = formData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    const passwordValid = await verifyPassword(password, user.password as string);
    if (!passwordValid) {
      return { error: "Invalid email or password" };
    }

    const token = await createSession({
      id: user.id,
      email: user.email,
      name: user.name as string,
      role: user.role as "ADMIN" | "MANAGER" | "USER",
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed" };
  }
}

export async function registerUser(formData: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    const validatedData = userSchema.parse(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashPassword = await hashedPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashPassword,
        role: "USER",
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    return { error: "Registration failed" };
  }
}

export async function createDemoAccount() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
    });

    if (existingUser) {
      return { success: true };
    }

    const hashPassword = await hashedPassword("Demo123!");

    await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
        password: hashPassword,
        role: "ADMIN",
      },
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to create demo account" };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
