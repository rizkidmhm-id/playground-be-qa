import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: The current user
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
 *       401:
 *         description: Missing, invalid, or expired token
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return errorResponse(error);
  }
}
