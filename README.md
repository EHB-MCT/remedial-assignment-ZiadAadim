[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BhMy8Rjk)
# Portfolio

Deadline DEV5 --> 18/08/2025

# Tiny Crypto Economy Simulation

A minimal **crypto webshop** with **dynamic pricing** driven by simulated demand/supply signals.  
**Frontend:** HTML + CSS + JS + Chart.js  
**Backend:** Node.js + Express  
**DB:** MongoDB

## What it does
- Shows crypto coins with live prices, stock, and a small price history graph
- Users can add to cart and “buy”
- A background simulation updates prices based on:
  - Sales velocity
  - Inventory pressure
  - Conversion rate
- All data is stored in MongoDB

## Why this fits this Dev 5 assignment
- Uses a **real database** (MongoDB) for persistence
- Has **meaningful simulation logic** (price updates from market signals)
- Focuses on backend logic & integration (not just UI)
- Minimal assets, heavy focus on programming and data flow

## Planned features
1. Product listing with live prices
2. Price history charts (Chart.js)
3. Cart and checkout
4. Simulation loop for dynamic pricing
5. View tracking for conversion rate
6. Simulation controls (start, pause, step)

## How to run (will be updated later)
For now, open `public/index.html` in your browser (mock mode works without backend).

## Branch plan (might change)
1. `feature/01-repo-setup` — repo setup & docs
2. `feature/02-frontend-skeleton` — basic HTML/CSS/JS UI with mock data
3. `feature/03-backend-scaffold` — Express server + health route
4. `feature/04-db-connection` — connect to MongoDB
5. `feature/05-schema-and-seed` — seed products into DB
6. `feature/06-api-products-and-history` — product & price history endpoints
7. `feature/07-pricing-strategy` — simulation logic
8. `feature/08-simulation-loop` — background price updates
9. `feature/09-checkout-orders-stock` — checkout endpoint
10. `feature/10-views-tracking` — track views
11. `feature/11-sim-controls` — simulation control endpoints
12. `feature/12-tests-docs` — unit tests + docs
13. `feature/13-cleanups-refactor` — refactor & polish

## License
MIT

## Running the backend (scaffold)
```bash
npm install
npm run dev
# server at http://localhost:3000
# health: http://localhost:3000/api/health
