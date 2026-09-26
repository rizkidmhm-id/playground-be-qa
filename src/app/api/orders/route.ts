import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { createOrderSchema } from "@/lib/validation/orders";
import { generateDisplayId } from "@/lib/orderId";
import { serializeOrder } from "@/lib/serializers";

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order for the current user (checkout completion)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shipping, payment, totals]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product: { type: object, properties: { id: { type: integer }, name: { type: string }, price: { type: integer } } }
 *                     quantity: { type: integer }
 *               shipping:
 *                 type: object
 *                 properties:
 *                   fullName: { type: string }
 *                   phone: { type: string }
 *                   address: { type: string }
 *                   city: { type: string }
 *                   postalCode: { type: string }
 *               payment:
 *                 type: object
 *                 properties:
 *                   method: { type: string, enum: [credit-card, gopay, bank-transfer] }
 *                   status: { type: string }
 *                   paidAt: { type: string }
 *               totals:
 *                 type: object
 *                 properties:
 *                   subtotal: { type: integer }
 *                   shippingFee: { type: integer }
 *                   grandTotal: { type: integer }
 *     responses:
 *       201:
 *         description: Order created
 *       401:
 *         description: Missing or invalid token
 *   get:
 *     summary: List the current user's orders, most recent first
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Orders
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = createOrderSchema.parse(await request.json());

    const order = await prisma.order.create({
      data: {
        displayId: generateDisplayId(),
        userId: user.id,
        shippingFullName: body.shipping.fullName,
        shippingPhone: body.shipping.phone,
        shippingAddress: body.shipping.address,
        shippingCity: body.shipping.city,
        shippingPostalCode: body.shipping.postalCode,
        paymentMethod: body.payment.method,
        paymentStatus: body.payment.status,
        paidAt: new Date(body.payment.paidAt),
        subtotal: body.totals.subtotal,
        shippingFee: body.totals.shippingFee,
        grandTotal: body.totals.grandTotal,
        items: {
          create: body.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            unitPrice: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(serializeOrder(order), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders.map(serializeOrder));
  } catch (error) {
    return errorResponse(error);
  }
}
