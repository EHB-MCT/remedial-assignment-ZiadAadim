/**
 * Adjust price based on:
 * - Random fluctuation
 * - Stock levels
 * - Optional demand factor
 */
export function calculateNextPrice(product) {
  let { currentPrice, minPrice, maxPrice, stock } = product;

  // Random market drift ±5%
  const drift = 1 + (Math.random() - 0.5) * 0.10; // ±5%

  // Stock influence — if stock low, price increases slightly
  const stockFactor = stock < 50 ? 1.05 : stock > 500 ? 0.98 : 1;

  // Combine effects
  let newPrice = currentPrice * drift * stockFactor;

  // Clamp within min/max
  if (newPrice < minPrice) newPrice = minPrice;
  if (newPrice > maxPrice) newPrice = maxPrice;

  // Round to 2 decimals
  return +newPrice.toFixed(2);
}
