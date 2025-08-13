// server/routes/tracking.js
import { Router } from "express";
import { ObjectId } from "mongodb";
import { colProducts, colViews } from "../collections.js";

const router = Router();

// In-memory throttle: (sessionId|ip) + productId => last timestamp
const lastView = new Map();
const WINDOW_MS = 15_000; // ignore repeats within 15s

function key(sessionId, ip, productId) {
  return `${sessionId || ip || "anon"}::${String(productId)}`;
}

router.post("/track/view", async (req, res, next) => {
  try {
    const { productId, sessionId } = req.body || {};
    if (!productId) return res.status(400).json({ error: "productId required" });

    let _id;
    try { _id = new ObjectId(String(productId)); }
    catch { return res.status(400).json({ error: "invalid productId" }); }

    // Ensure product exists
    const prod = await colProducts().findOne({ _id }, { projection: { _id: 1 } });
    if (!prod) return res.status(404).json({ error: "product not found" });

    // Throttle per session+product (or IP if no sessionId)
    const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "").trim();
    const k = key(sessionId, ip, _id);
    const now = Date.now();
    const last = lastView.get(k);
    if (last && now - last < WINDOW_MS) {
      return res.json({ ok: true, throttled: true }); // silently accept
    }
    lastView.set(k, now);

    // Record view
    await colViews().insertOne({
      productId: _id,
      sessionId: sessionId || null,
      ip: ip || null,
      userAgent: req.headers["user-agent"] || null,
      createdAt: new Date()
    });

    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
