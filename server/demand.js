import { ObjectId } from "mongodb";
import { colOrders, colViews } from "./collections.js";

/**
 * Reads simple demand signal for the last N minutes.
 * Returns { sales, views }. If collections are empty → {0,0}.
 */
export async function readDemandSignal(productId, minutes = 60) {
  const _id = productId instanceof ObjectId ? productId : new ObjectId(productId);
  const since = new Date(Date.now() - minutes * 60_000);

  // Sales = sum of quantities in orders
  const salesAgg = await colOrders().aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $unwind: "$items" },
    { $match: { "items.productId": _id } },
    { $group: { _id: null, qty: { $sum: "$items.qty" } } }
  ]).toArray();
  const sales = salesAgg[0]?.qty ?? 0;

  // Views = total view events
  const views = await colViews().countDocuments({ productId: _id, createdAt: { $gte: since } });

  return { sales, views };
}
