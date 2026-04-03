import crypto from "crypto";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-in-production-12345678";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "USER";
}

export interface Session {
  user: SessionUser;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf-8");
}

export async function createSession(user: SessionUser): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days

  const header = { alg: "HS256", typ: "JWT" };
  const payload = { user, iat, exp };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const message = `${headerEncoded}.${payloadEncoded}`;

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(message)
    .digest("base64url");

  return `${message}.${signature}`;
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
    const message = `${headerEncoded}.${payloadEncoded}`;

    const signature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(message)
      .digest("base64url");

    if (signature !== signatureEncoded) {
      return null;
    }

    const payloadStr = base64UrlDecode(payloadEncoded);
    const payload = JSON.parse(payloadStr) as Session;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
