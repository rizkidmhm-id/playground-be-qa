import { createSwaggerSpec } from "next-swagger-doc";

export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "QA Playground Shop API",
        version: "1.0.0",
        description:
          "Backend for the QA Playground Shop frontend: login through checkout, payment, and order history.",
      },
      servers: [{ url: "http://localhost:4000", description: "Local dev" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {},
      },
      tags: [
        { name: "Auth", description: "Registration, login, session" },
        { name: "Products", description: "Product catalog" },
        { name: "Payments", description: "Mock payment processing" },
        { name: "Orders", description: "Checkout completion and order history" },
      ],
    },
  });
}
