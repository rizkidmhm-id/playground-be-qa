import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApiError, errorResponse } from "@/lib/errors";
import { registerSchema } from "@/lib/validation/auth";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Jane Doe" }
 *               email: { type: string, format: email, example: "jane@example.com" }
 *               password: { type: string, minLength: 6, example: "Password123" }
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     email: { type: string }
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
