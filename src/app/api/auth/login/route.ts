import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApiError, errorResponse } from "@/lib/errors";
import { signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a Bearer token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "qa@playground.test" }
 *               password: { type: string, example: "Password123" }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     email: { type: string }
 *       401:
 *         description: Invalid email or password
 */
export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    const passwordMatches = user ? await bcrypt.compare(body.password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = signToken({ sub: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
