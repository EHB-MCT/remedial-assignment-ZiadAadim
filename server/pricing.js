/**
 * Adjust price based on:
 * - Random fluctuation
 * - Stock levels
 * - Optional demand factor
 * - demand: { sales: number, views: number }
 */
/**
 */
export function calculateNextPrice(product, demand = { sales: 0, views: 0 }) {
  let { currentPrice, minPrice, maxPrice, stock } = product;
  const { sales = 0, views = 0 } = demand;

  // --- Base random drift ±5%
  const drift = 1 + (Math.random() - 0.5) * 0.10;

  // --- Stock influence
  const stockFactor = stock < 50 ? 1.05 : stock > 500 ? 0.98 : 1;

  // --- Demand influence (uses conversion-like signal)
  // If views > 0, conv = sales/views (0..1). If views == 0, neutral.
  let demandFactor = 1;
  if (views > 0) {
    const conv = Math.min(1, sales / views);         // clamp 0..1
    const boost = (conv - 0.05) * 2.0;                // baseline 5% conv → 0, scale
    demandFactor = 1 + Math.max(-0.08, Math.min(0.08, boost)); // cap ±8%
  }

  let newPrice = currentPrice * drift * stockFactor * demandFactor;

  // Clamp & round
  if (newPrice < minPrice) newPrice = minPrice;
  if (newPrice > maxPrice) newPrice = maxPrice;
  return +newPrice.toFixed(2);
}
