import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Kept in exact parity with the frontend's mock catalog at
// playground-qa/src/data/products.js, including IDs, so existing
// manual/automated tests that assert against those IDs keep working.
const products = [
  { id: 1, name: "Wireless Mouse", category: "Electronics", price: 150000, rating: 4.5, stock: 25, emoji: "🖱️", description: "Ergonomic 2.4GHz wireless mouse with silent click." },
  { id: 2, name: "Mechanical Keyboard", category: "Electronics", price: 750000, rating: 4.8, stock: 12, emoji: "⌨️", description: "Hot-swappable mechanical keyboard with RGB backlight." },
  { id: 3, name: "USB-C Hub 7-in-1", category: "Electronics", price: 350000, rating: 4.2, stock: 30, emoji: "🔌", description: "7-in-1 hub with HDMI, USB 3.0, and SD card reader." },
  { id: 4, name: "Noise Cancelling Headphones", category: "Electronics", price: 1250000, rating: 4.7, stock: 8, emoji: "🎧", description: "Over-ear ANC headphones with 30h battery life." },
  { id: 5, name: "Cotton T-Shirt", category: "Fashion", price: 99000, rating: 4.0, stock: 50, emoji: "👕", description: "100% combed cotton tee, unisex fit." },
  { id: 6, name: "Denim Jacket", category: "Fashion", price: 450000, rating: 4.4, stock: 15, emoji: "🧥", description: "Classic-cut denim jacket, stone washed." },
  { id: 7, name: "Running Shoes", category: "Fashion", price: 899000, rating: 4.6, stock: 20, emoji: "👟", description: "Lightweight cushioned running shoes." },
  { id: 8, name: "Canvas Tote Bag", category: "Fashion", price: 120000, rating: 3.9, stock: 40, emoji: "👜", description: 'Heavy-duty canvas tote, fits a 14" laptop.' },
  { id: 9, name: "Espresso Coffee Beans 1kg", category: "Groceries", price: 185000, rating: 4.3, stock: 35, emoji: "☕", description: "Single-origin arabica beans, medium roast." },
  { id: 10, name: "Matcha Powder 100g", category: "Groceries", price: 95000, rating: 4.1, stock: 45, emoji: "🍵", description: "Ceremonial-grade Japanese matcha." },
  { id: 11, name: "Granola Mix 500g", category: "Groceries", price: 78000, rating: 3.8, stock: 60, emoji: "🥣", description: "Honey-baked granola with nuts and dried fruit." },
  { id: 12, name: "Yoga Mat", category: "Sports", price: 250000, rating: 4.5, stock: 18, emoji: "🧘", description: "6mm non-slip TPE yoga mat with strap." },
  { id: 13, name: "Dumbbell Set 10kg", category: "Sports", price: 520000, rating: 4.4, stock: 10, emoji: "🏋️", description: "Adjustable dumbbell pair, 2×5kg plates." },
  { id: 14, name: "Badminton Racket", category: "Sports", price: 320000, rating: 4.2, stock: 22, emoji: "🏸", description: "Carbon-fiber racket, pre-strung 24lbs." },
];

// Same seeded QA account the frontend mock already exposes, so logging in
// with these credentials works identically against the real backend.
const SEED_USER = {
  name: "QA Tester",
  email: "qa@playground.test",
  password: "Password123",
};

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  const passwordHash = await bcrypt.hash(SEED_USER.password, 10);
  await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {},
    create: {
      name: SEED_USER.name,
      email: SEED_USER.email,
      passwordHash,
    },
  });

  console.log(`Seeded ${products.length} products and the QA test account (${SEED_USER.email}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
