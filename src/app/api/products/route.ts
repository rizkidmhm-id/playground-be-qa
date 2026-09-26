import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/errors";

const SORTERS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  "name-asc": { name: "asc" },
  "name-desc": { name: "desc" },
  "rating-desc": { rating: "desc" },
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List products, with the same search/filter/sort options as the frontend's mock
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Case-insensitive substring match on product name
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price-asc, price-desc, name-asc, name-desc, rating-desc] }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Matching products
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const q = params.get("q")?.trim() ?? "";
    const category = params.get("category") ?? "";
    const sort = params.get("sort") ?? "";
    const minPrice = params.get("minPrice");
    const maxPrice = params.get("maxPrice");

    const where: Prisma.ProductWhereInput = {};
    if (q) where.name = { contains: q, mode: "insensitive" };
    if (category) where.category = category;
    if (minPrice) where.price = { ...(where.price as object), gte: Number(minPrice) };
    if (maxPrice) where.price = { ...(where.price as object), lte: Number(maxPrice) };

    const products = await prisma.product.findMany({
      where,
      orderBy: SORTERS[sort] ?? { id: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    return errorResponse(error);
  }
}
