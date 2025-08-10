// server/schema.js
import { getDB } from "./db.js";

/**
 * Create indexes for collections (safe to call multiple times).
 */
export async function ensureIndexes() {
  const db = getDB();

  // products
  await db.collection("products").createIndexes([
    { key: { sku: 1 }, name: "uniq_sku", unique: true },
    { key: { updatedAt: -1 }, name: "updated_desc" }
  ]);

  // pricePoints (history of prices per tick)
  await db.collection("pricePoints").createIndexes([
    { key: { productId: 1, createdAt: -1 }, name: "pp_product_time" }
  ]);

  // orders
  await db.collection("orders").createIndexes([
    { key: { createdAt: -1 }, name: "orders_time_desc" }
  ]);

  // views (for conversion rate)
  await db.collection("views").createIndexes([
    { key: { productId: 1, createdAt: -1 }, name: "views_product_time" }
  ]);

  // ticks
  await db.collection("ticks").createIndexes([
    { key: { number: -1 }, name: "tick_number_desc", unique: true }
  ]);
}
