/**
 * Auth Server Module
 * Centralized authentication functionality for server-side usage
 */

export {
  getSession as auth,
  createSession,
  deleteSession,
  getSession,
} from "./session";
export type { Session, SessionUser } from "./session";

export {
  createUser,
  getUserByEmail,
  getUserById,
  hashedPassword,
  verifyPassword,
  verifyUserCredentials,
} from "./auth";
