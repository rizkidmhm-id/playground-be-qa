import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./db";
import { ApiError } from "./errors";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export type TokenPayload = { sub: string; email: string };

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired token.");
  }
}

/** Reads the Bearer token, verifies it, and loads the current user. Throws 401 if missing/invalid. */
export async function requireUser(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Missing or malformed Authorization header. Expected: Bearer <token>.");
  }

  const payload = verifyToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user) {
    throw new ApiError(401, "The user for this token no longer exists.");
  }

  return user;
}
