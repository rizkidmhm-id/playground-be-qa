import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ApiError, errorResponse } from "@/lib/errors";
import { serializeOrder } from "@/lib/serializers";

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order belonging to the current user
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: The order's display id, e.g. ORD-20260926-4821
 *     responses:
 *       200:
 *         description: The order
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Order not found
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { displayId: id, userId: user.id },
      include: { items: true },
    });

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    return NextResponse.json(serializeOrder(order));
  } catch (error) {
    return errorResponse(error);
  }
}
