# Conventions

## Project structure
- `db.js` — DB connection
- `collections.js` — typed collection helpers
- `pricing.js` — price calculation logic
- `demand.js` — demand signals
- `sim.js` — simulation loop
- `routes/*` — Express routers

## API (detail)
- `GET /api/products` → product list
- `GET /api/products/:id/history?limit=40` → price history
- `POST /api/checkout` → create order, decrement stock
- `POST /api/track/view` → track view (throttled)
- `GET /api/sim/state` → simulation status

## Simulation logic
- Price updates every `SIM_INTERVAL_MS` (default 5000ms)
- Influenced by:
  - sales velocity
  - stock pressure
  - conversion rate
- History trimming keeps ~40 points per product.

