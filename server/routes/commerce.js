// server/routes/commerce.js
import { Router } from "express";
import { ObjectId } from "mongodb";
import { colProducts, colOrders } from "../collections.js";

const router = Router();

/**
 * POST /api/checkout
 * Body: { sessionId: string, items: [{ productId: string, qty: number }] }
 *
 * Steps:
 * 1) Validate input.
 * 2) Load products and verify sufficient stock.
 * 3) Atomically decrement stock per item (filter: stock >= qty).
 * 4) If any decrement fails, rollback previous decrements and report error.
 * 5) Insert order snapshot with prices-at-purchase and total.
 */
router.post("/checkout", async (req, res, next) => {
  try {
    const { sessionId, items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items array required" });
    }

    // Normalize & validate items
    const parsed = [];
    for (const it of items) {
      if (!it?.productId) return res.status(400).json({ error: "productId missing" });
      let _id;
      try { _id = new ObjectId(String(it.productId)); }
      catch { return res.status(400).json({ error: `invalid productId ${it.productId}` }); }

      const qty = Math.floor(Number(it.qty));
      if (!Number.isFinite(qty) || qty < 1) {
        return res.status(400).json({ error: `invalid qty for ${it.productId}` });
      }
      parsed.push({ productId: _id, qty });
    }

    // Load products snapshot
    const ids = parsed.map(p => p.productId);
    const prods = await colProducts().find({ _id: { $in: ids } }).toArray();
    if (prods.length !== parsed.length) {
      return res.status(404).json({ error: "one or more products not found" });
    }
    const byId = new Map(prods.map(p => [String(p._id), p]));

    // Verify stock
    for (const it of parsed) {
      const p = byId.get(String(it.productId));
      if ((p?.stock ?? 0) < it.qty) {
        return res.status(409).json({ error: "insufficient stock", productId: String(it.productId), available: p?.stock ?? 0 });
      }
    }

    // Atomically decrement stock per item. Track successes for rollback.
    const decremented = [];
    for (const it of parsed) {
      const resUpd = await colProducts().updateOne(
        { _id: it.productId, stock: { $gte: it.qty } },
        { $inc: { stock: -it.qty }, $set: { updatedAt: new Date() } }
      );
      if (resUpd.modifiedCount !== 1) {
        // rollback any prior decrements
        for (const ok of decremented) {
          await colProducts().updateOne(
            { _id: ok.productId },
            { $inc: { stock: ok.qty }, $set: { updatedAt: new Date() } }
          );
        }
        return res.status(409).json({ error: "concurrent stock change; please retry" });
      }
      decremented.push(it);
    }

    // Build order snapshot with priceAtPurchase
    const orderItems = parsed.map(it => {
      const p = byId.get(String(it.productId));
      return {
        productId: it.productId,
        sku: p.sku,
        name: p.name,
        qty: it.qty,
        priceAtPurchase: Number(p.currentPrice)
      };
    });
    const total = orderItems.reduce((sum, it) => sum + it.qty * it.priceAtPurchase, 0);
    const orderDoc = {
      sessionId: sessionId || null,
      items: orderItems,
      total: Number(total.toFixed(2)),
      createdAt: new Date()
    };

    const ins = await colOrders().insertOne(orderDoc);

    return res.json({
      ok: true,
      orderId: String(ins.insertedId),
      total: orderDoc.total,
      items: orderItems.map(i => ({ productId: String(i.productId), qty: i.qty, price: i.priceAtPurchase }))
    });
  } catch (e) {
    next(e);
  }
});

export default router;
