# Integrating with the QA Playground Shop frontend

The frontend (`../playground-qa`) currently runs on three mock services that persist to `localStorage`: `src/services/authService.js`, `productService.js`, `orderService.js`. Each one already documents the exact REST endpoint it mirrors. This backend implements that contract, so **only those three files need to change** — no store, page, or component in the frontend needs to be touched.

This document has not been applied to the frontend repo; it's a ready-to-paste reference. Ask if you'd like it applied directly.

## 1. Add an env var to the frontend

Create `playground-qa/.env` (Vite auto-loads it):

```
VITE_API_BASE_URL=http://localhost:4000/api
```

## 2. Why the token needs no store changes

Login/register on this backend return a **Bearer JWT** in the response body (not a cookie). `stores/auth.js` already persists whatever `authService.login()` returns into `localStorage` under the key `qa-playground:session`, and clears that same key on logout:

```js
// stores/auth.js (unchanged)
async login(email, password) {
  const user = await authService.login(email, password)
  this.user = user
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))   // <- token rides along for free
  return user
},
logout() {
  this.user = null
  localStorage.removeItem(SESSION_KEY)                       // <- token cleared for free
},
```

So the replacement `authService.login()` below folds the token into the same object it already returns (`{ id, name, email, token }`). The API client then reads the token straight out of `qa-playground:session` in `localStorage`. This also avoids a circular import (`services` importing from `stores`, which import from `services`).

## 3. New file: `src/services/apiClient.js`

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const SESSION_KEY = 'qa-playground:session'

function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    return session?.token || null
  } catch {
    return null
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Something went wrong. Please try again.')
  }
  return data
}
```

## 4. Replace `src/services/authService.js`

```js
// Real auth API. See ../../playground-qa-backend/README.md for endpoint details.
import { apiFetch } from './apiClient'

export async function login(email, password) {
  const { token, user } = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
  return { ...user, token }
}

export async function register({ name, email, password }) {
  const { user } = await apiFetch('/auth/register', { method: 'POST', body: { name, email, password } })
  return user
}
```

## 5. Replace `src/services/productService.js`

```js
import { apiFetch } from './apiClient'

export async function fetchProducts({ q = '', category = '', sort = '', minPrice = null, maxPrice = null } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  if (sort) params.set('sort', sort)
  if (minPrice != null && minPrice !== '') params.set('minPrice', minPrice)
  if (maxPrice != null && maxPrice !== '') params.set('maxPrice', maxPrice)

  return apiFetch(`/products?${params.toString()}`)
}

export async function fetchCategories() {
  return apiFetch('/products/categories')
}
```

## 6. Replace `src/services/orderService.js`

```js
import { apiFetch } from './apiClient'

export async function processPayment({ method, card }) {
  return apiFetch('/payments', { method: 'POST', body: { method, card }, auth: true })
}

export async function createOrder({ items, shipping, payment, totals }) {
  return apiFetch('/orders', { method: 'POST', body: { items, shipping, payment, totals }, auth: true })
}
```

Every exported function keeps its original name and signature, so `stores/auth.js`, `stores/orders.js`, `stores/cart.js`, and every page (`LoginPage.vue`, `RegisterPage.vue`, `HomePage.vue`, `CheckoutPage.vue`, `PaymentPage.vue`, `OrderCompletePage.vue`) work unmodified.

## 7. Error messages keep working unchanged

The frontend already does `catch (err) { serverError.value = err.message }` in `LoginPage.vue`, `RegisterPage.vue`, `PaymentPage.vue`, etc. `apiFetch` throws `new Error(data.error.message)` on any non-2xx response, and every backend error uses the envelope `{ "error": { "message": "..." } }` — so those catch blocks display the real backend message (e.g. "Invalid email or password.", "Payment declined. Your card was rejected by the issuer.") with no changes needed.

## 8. Running both apps together

```bash
# Terminal 1
cd playground-qa-backend
npm run dev            # http://localhost:4000

# Terminal 2
cd playground-qa
npm run dev             # http://localhost:5173
```

The backend's `FRONTEND_ORIGIN` env var (default `http://localhost:5173`) must match the Vite dev server's origin for CORS to allow the requests.

## 9. Manually verifying the wire-up

1. Log in with the seeded account (`qa@playground.test` / `Password123`) — Network tab should show `POST /api/auth/login` returning a token.
2. Browse products on the home page — `GET /api/products` should return the 14 seeded products.
3. Add an item to cart, check out, pay with `4111 1111 1111 1111` — should reach `OrderCompletePage` with a real `ORD-YYYYMMDD-XXXX` id from the database.
4. Pay with `4000 0000 0000 0002` — should surface "Payment declined. Your card was rejected by the issuer." on the payment page.
