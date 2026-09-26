# QA Playground Shop — Backend

Next.js (App Router, TypeScript) API server backing the [QA Playground Shop](../playground-qa) frontend: registration, login, product catalog, mock payments, and order creation/history, persisted in PostgreSQL via Prisma.

It implements the exact contract the frontend's mock services already documented (`src/services/*.js` in the frontend repo), so integrating is a matter of swapping those three files for real `fetch` calls — see [`INTEGRATION.md`](./INTEGRATION.md).

## Stack

- **Next.js 16** (App Router route handlers used purely as an API server)
- **PostgreSQL** + **Prisma ORM** (schema, migrations, seed script)
- **bcryptjs** for password hashing, **jsonwebtoken** for Bearer tokens, **zod** for request validation
- **next-swagger-doc** + **swagger-ui-react** for interactive API docs
- Hand-authored **Postman collection** for manual/CI smoke testing

## Prerequisites

- Node.js 20+
- A local PostgreSQL server. On macOS: `brew install postgresql@17 && brew services start postgresql@17`

## Setup

```bash
npm install

# Create the database (once)
createdb playground_qa

# Configure environment
cp .env.example .env
# edit .env: set DATABASE_URL to your macOS username, e.g.
#   postgresql://YOUR_USERNAME@localhost:5432/playground_qa?schema=public

# Apply the schema and seed data (14 products + the QA test account)
npx prisma migrate dev
npm run db:seed
```

## Run

```bash
npm run dev
```

The API listens on **http://localhost:4000** (see `PORT` in `.env`; the dev/start scripts hardcode `-p 4000` so it never collides with the frontend's Vite dev server on 5173).

- Landing page: http://localhost:4000
- Swagger UI: http://localhost:4000/docs
- OpenAPI JSON: http://localhost:4000/api/docs

## Seeded test account

Matches the frontend mock exactly, so existing manual/automated tests keep working unchanged:

```
email:    qa@playground.test
password: Password123
```

## API summary

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | – | Create an account |
| `POST /api/auth/login` | – | Returns `{ token, user }` |
| `GET /api/auth/me` | Bearer | Validate a stored token |
| `GET /api/products` | – | `?q=&category=&sort=&minPrice=&maxPrice=` |
| `GET /api/products/categories` | – | Distinct category names |
| `POST /api/payments` | Bearer | Mock payment; see test cards below |
| `POST /api/orders` | Bearer | Create an order from the current user's checkout |
| `GET /api/orders` | Bearer | List the current user's orders |
| `GET /api/orders/:id` | Bearer | Fetch a single order by its display id |

Full request/response schemas: Swagger UI at `/docs`.

### Deterministic test cards (credit-card payments)

| Card number | Result |
|---|---|
| `4111 1111 1111 1111` (or any other valid 16-digit number) | Success |
| `4000 0000 0000 0002` | Declined (`402`) |

GoPay and bank-transfer always succeed, matching the frontend's mock.

## Testing the API directly

**Postman**: import `postman/playground-qa-backend.postman_collection.json` and `postman/playground-qa-backend.postman_environment.json`. Run "Auth → Login" first — it captures the token into the environment automatically for every subsequent request.

**Newman (CLI)**:
```bash
npx newman run postman/playground-qa-backend.postman_collection.json \
  -e postman/playground-qa-backend.postman_environment.json
```

## Project layout

```
prisma/schema.prisma, prisma/seed.ts      Data model + seed data
src/app/api/**/route.ts                   Route handlers (one per endpoint)
src/app/docs/page.tsx                     Swagger UI page
src/app/api/docs/route.ts                 Generated OpenAPI JSON
src/lib/db.ts                             Prisma client singleton
src/lib/auth.ts                           JWT sign/verify, requireUser()
src/lib/errors.ts                         ApiError + consistent error envelope
src/lib/serializers.ts                    DB row -> frontend-shaped JSON
src/lib/validation/*.ts                   zod request schemas
src/proxy.ts                              CORS (Next.js 16 "proxy" convention)
postman/                                  Collection + environment
```

## Production build

```bash
npm run build
npm run start
```
