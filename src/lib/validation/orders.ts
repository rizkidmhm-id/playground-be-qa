import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.object({
          id: z.number().int(),
          name: z.string(),
          price: z.number().int(),
        }),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "An order must contain at least one item."),
  shipping: z.object({
    fullName: z.string().trim().min(1, "Full name is required."),
    phone: z.string().trim().min(1, "Phone number is required."),
    address: z.string().trim().min(1, "Address is required."),
    city: z.string().trim().min(1, "City is required."),
    postalCode: z.string().trim().min(1, "Postal code is required."),
  }),
  payment: z.object({
    method: z.enum(["credit-card", "gopay", "bank-transfer"]),
    status: z.string(),
    paidAt: z.string(),
  }),
  totals: z.object({
    subtotal: z.number().int().nonnegative(),
    shippingFee: z.number().int().nonnegative(),
    grandTotal: z.number().int().nonnegative(),
  }),
});
