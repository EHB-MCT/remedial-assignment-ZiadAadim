import { SIM_INTERVAL_MS } from "./config.js";
import { colProducts, colPricePoints, colTicks } from "./collections.js";
import { readDemandSignal } from "./demand.js";
import { calculateNextPrice } from "./pricing.js";

let running = false;
let interval = null;
let tick = 0;

export async function initSimulation() {
  // resume from last stored tick, if any
  const last = await colTicks().find().sort({ number: -1 }).limit(1).toArray();
  tick = last[0]?.number ?? 0;
}

export function getSimState() {
  return { status: running ? "running" : "paused", tick };
}

export async function tickOnce() {
  const products = await colProducts().find({}).toArray();
  let updated = 0;

  for (const p of products) {
    // read demand (neutral if no data yet)
    const demand = await readDemandSignal(p._id, 60);
    const newPrice = calculateNextPrice(p, demand);

    await colProducts().updateOne(
      { _id: p._id },
      { $set: { currentPrice: newPrice, updatedAt: new Date() } }
    );

    await colPricePoints().insertOne({
      productId: p._id,
      price: newPrice,
      createdAt: new Date()
    });

    updated++;
  }

  tick += 1;
  await colTicks().insertOne({ number: tick, ranAt: new Date(), updated });
  return { tick, updated };
}

export function startSimulation(intervalMs = SIM_INTERVAL_MS) {
  if (running) return;
  running = true;
  interval = setInterval(() => {
    tickOnce().catch(err => {
      // don’t crash the process; log and keep trying next interval
      console.error("[sim] tick error:", err?.message || err);
    });
  }, intervalMs);
  console.log(`[sim] started @ ${intervalMs}ms`);
}

export function pauseSimulation() {
  if (interval) clearInterval(interval);
  interval = null;
  running = false;
  console.log("[sim] paused");
}
