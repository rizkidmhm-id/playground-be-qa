import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: List distinct product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Category names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 */
export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    return NextResponse.json(rows.map((r) => r.category));
  } catch (error) {
    return errorResponse(error);
  }
}
