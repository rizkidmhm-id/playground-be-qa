import { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

/**
 * Shapes a persisted order back into the exact object shape the frontend
 * mock's `createOrder()` already returns, so `OrderCompletePage.vue` and
 * `CheckoutPage.vue` need no changes: { id, items, shipping, payment, totals, createdAt }.
 */
export function serializeOrder(order: OrderWithItems) {
  return {
    id: order.displayId,
    items: order.items.map((item) => ({
      product: { id: item.productId, name: item.productName, price: item.unitPrice },
      quantity: item.quantity,
    })),
    shipping: {
      fullName: order.shippingFullName,
      phone: order.shippingPhone,
      address: order.shippingAddress,
      city: order.shippingCity,
      postalCode: order.shippingPostalCode,
    },
    payment: {
      method: order.paymentMethod,
      status: order.paymentStatus,
      paidAt: order.paidAt?.toISOString() ?? null,
    },
    totals: {
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      grandTotal: order.grandTotal,
    },
    createdAt: order.createdAt.toISOString(),
  };
}
