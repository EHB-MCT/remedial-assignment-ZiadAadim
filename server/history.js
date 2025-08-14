import { ObjectId } from "mongodb";
import { colPricePoints } from "./collections.js";

export async function trimPriceHistory(productId, keep = 300) {
  const _id = productId instanceof ObjectId ? productId : new ObjectId(productId);
  const oldIds = await colPricePoints().aggregate([
    { $match: { productId: _id } },
    { $sort: { createdAt: -1 } },
    { $skip: keep },
    { $project: { _id: 1 } }
  ]).toArray();

  if (oldIds.length) {
    await colPricePoints().deleteMany({ _id: { $in: oldIds.map(d => d._id) } });
  }
}
