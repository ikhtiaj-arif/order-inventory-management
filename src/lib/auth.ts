import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

/**
 * Hash a password using bcryptjs
 */
export async function hashedPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  });
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  name: string,
  password: string,
) {
  const hashPassword = await hashedPassword(password);

  return prisma.user.create({
    data: {
      email,
      name,
      password: hashPassword,
      role: "USER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

/**
 * Verify user credentials
 */
export async function verifyUserCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  });
}

/**
 * Generate a JWT token for a given user ID
 */
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || "default_secret";
  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
}

