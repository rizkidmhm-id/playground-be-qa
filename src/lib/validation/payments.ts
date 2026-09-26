import { z } from "zod";

export const paymentSchema = z
  .object({
    method: z.enum(["credit-card", "gopay", "bank-transfer"]),
    card: z
      .object({
        number: z.string(),
        name: z.string(),
        expiry: z.string(),
        cvv: z.string(),
      })
      .partial()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method !== "credit-card") return;

    const digits = (data.card?.number ?? "").replace(/\s/g, "");
    if (!/^\d{16}$/.test(digits)) {
      ctx.addIssue({ code: "custom", path: ["card", "number"], message: "Card number must be 16 digits." });
    }
    if (!data.card?.name?.trim()) {
      ctx.addIssue({ code: "custom", path: ["card", "name"], message: "Cardholder name is required." });
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.card?.expiry?.trim() ?? "")) {
      ctx.addIssue({ code: "custom", path: ["card", "expiry"], message: "Use MM/YY format." });
    }
    if (!/^\d{3,4}$/.test(data.card?.cvv?.trim() ?? "")) {
      ctx.addIssue({ code: "custom", path: ["card", "cvv"], message: "CVV must be 3-4 digits." });
    }
  });
