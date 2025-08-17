import dotenv from "dotenv";
dotenv.config();

import { connectDB, getDB, closeDB } from "./db.js";
import { ensureIndexes } from "./schema.js";

const now = () => new Date();

const productsSeed = [
  {
    sku: "CR-001",
    name: "JugoCoin",
    basePrice: 199.99,
    currentPrice: 199.99,
    minPrice: 120.00,
    maxPrice: 800.00,
    stock: 500
  },
  {
    sku: "CR-002",
    name: "Rotom",
    basePrice: 649.49,
    currentPrice: 649.49,
    minPrice: 350.00,
    maxPrice: 2500.00,
    stock: 300
  },
  {
    sku: "CR-003",
    name: "Porygon",
    basePrice: 425.75,
    currentPrice: 425.75,
    minPrice: 250.00,
    maxPrice: 1800.00,
    stock: 400
  },
  {
    sku: "CR-004",
    name: "Kassir",
    basePrice: 1150.00,
    currentPrice: 1150.00,
    minPrice: 600.00,
    maxPrice: 6000.00,
    stock: 200
  }
];

async function run() {
  try {
    await connectDB();
    const db = getDB();

    await ensureIndexes();

    const coll = db.collection("products");

for (const p of productsSeed) {
  const nowDate = now();

  // fields we always update (excluding createdAt)
  const setFields = {
    sku: p.sku,
    name: p.name,
    basePrice: p.basePrice,
    currentPrice: p.currentPrice,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    stock: p.stock,
    updatedAt: nowDate
  };

  await coll.updateOne(
    { sku: p.sku },
    {
      $setOnInsert: { createdAt: nowDate },
      $set: setFields
    },
    { upsert: true }
  );
}

    console.log(`Seed complete. Upserted ${productsSeed.length} products.`);
  } catch (e) {
    console.error("Seed failed:", e.message);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

run();