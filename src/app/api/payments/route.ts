import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ApiError, errorResponse } from "@/lib/errors";
import { paymentSchema } from "@/lib/validation/payments";

const DECLINED_CARD = "4000000000000002";

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a mock payment
 *     description: >
 *       Deterministic outcomes for automation, matching the frontend's mock:
 *       credit-card number 4111 1111 1111 1111 (or any other valid 16-digit
 *       number) succeeds, 4000 0000 0000 0002 is declined. gopay and
 *       bank-transfer always succeed.
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [method]
 *             properties:
 *               method: { type: string, enum: [credit-card, gopay, bank-transfer] }
 *               card:
 *                 type: object
 *                 properties:
 *                   number: { type: string, example: "4111 1111 1111 1111" }
 *                   name: { type: string }
 *                   expiry: { type: string, example: "12/30" }
 *                   cvv: { type: string, example: "123" }
 *     responses:
 *       200:
 *         description: Payment approved
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       402:
 *         description: Payment declined
 */
export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    const body = paymentSchema.parse(await request.json());

    if (body.method === "credit-card") {
      const digits = (body.card?.number ?? "").replace(/\s/g, "");
      if (digits === DECLINED_CARD) {
        throw new ApiError(402, "Payment declined. Your card was rejected by the issuer.");
      }
    }

    return NextResponse.json({ status: "paid", paidAt: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}
