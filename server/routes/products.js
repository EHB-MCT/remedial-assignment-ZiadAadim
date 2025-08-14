import { Router } from "express";
import { ObjectId } from "mongodb";
import { colProducts, colPricePoints } from "../collections.js";
import { calculateNextPrice } from "../pricing.js";
import { readDemandSignal } from "../demand.js";


const router = Router();

/** GET /api/products
 *  Returns a lightweight list of products for the shop grid.
 */
router.get("/products", async (req, res, next) => {
  try {
    const docs = await colProducts()
      .find({}, { projection: { name: 1, sku: 1, currentPrice: 1, stock: 1 } })
      .sort({ name: 1 })
      .toArray();

    // Ensure _id is serialized as string
    const result = docs.map(d => ({ ...d, _id: String(d._id) }));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/** GET /api/products/:id/history?limit=40
 *  Returns price history points. If none exist yet, synthesize a small series.
 */
router.get("/products/:id/history", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "40", 10) || 40, 200);
    const id = req.params.id;

    // 1) Load the product (accept ObjectId or fail 404)
    let _id;
    try {
      _id = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: "invalid product id" });
    }
    const product = await colProducts().findOne({ _id });
    if (!product) return res.status(404).json({ error: "product not found" });

    // 2) Fetch real history from DB (if any)
    const points = await colPricePoints()
      .find({ productId: _id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    if (points.length > 0) {
      // Return oldest → newest
      const series = points
        .reverse()
        .map((p, i) => ({ tick: i, price: Number(p.price) }));
      return res.json(series);
    }

    // 3) No history yet? Synthesize a small random-walk series
    const out = [];
    let v = Number(product.currentPrice) || 100;
    for (let i = 0; i < limit; i++) {
      const drift = (Math.random() - 0.5) * 0.02; // ±2%
      v = Math.max(0.01, +(v * (1 + drift)).toFixed(2));
      out.push({ tick: i, price: v });
    }
    return res.json(out);
  } catch (e) {
    next(e);
  }
});

/** POST /api/products/:id/reprice */
router.post("/products/:id/reprice", async (req, res, next) => {
  try {
    const id = req.params.id;
    let _id;
    try { _id = new ObjectId(id); }
    catch { return res.status(400).json({ error: "invalid product id" }); }

    const product = await colProducts().findOne({ _id });
    if (!product) return res.status(404).json({ error: "product not found" });

    // NEW: read last-60-min demand (neutral if no data yet)
    const demand = await readDemandSignal(_id, 60);

    const newPrice = calculateNextPrice(product, demand);

    await colProducts().updateOne(
      { _id },
      { $set: { currentPrice: newPrice, updatedAt: new Date() } }
    );
    await colPricePoints().insertOne({
      productId: _id,
      price: newPrice,
      createdAt: new Date(),
    });

    res.json({ demand, oldPrice: product.currentPrice, newPrice });
  } catch (e) { next(e); }
});

export default router;
