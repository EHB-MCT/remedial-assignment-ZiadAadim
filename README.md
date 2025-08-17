[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BhMy8Rjk)
# Portfolio

> ℹ️ This README provides a general overview of the project.  
> For detailed contribution guidelines, conventions, and policies, see [CONTRIBUTING.md](CONTRIBUTING.md), [CONVENTIONS.md](CONVENTIONS.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Note: The codebase contains inline comments throughout the files to help guide you across the structure and logic of the project.


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

## Features
1. Product listing with live prices
2. Price history charts (Chart.js)
3. Cart and checkout
4. Simulation loop for dynamic pricing
5. View tracking for conversion rate


## Branches
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

## License
MIT

## Running the backend
```bash
npm install
npm run dev
# server at http://localhost:3000
# health: http://localhost:3000/api/health

## Seeding the database
```bash
cp .env.example .env  
npm run seed
Seeds 4 cryptos: JugoCoin, Rotom, Porygon, Kassir (upsert by SKU).


```md
## API (summary)

- `GET /api/products`  
  Returns: `[{ _id, name, sku, currentPrice, stock }]`

- `GET /api/products/:id/history?limit=40`  
  Returns: `[{ tick, price }]` (real points; synthetic fallback if none)

- `POST /api/checkout`
  ```json
  { "sessionId": "abc", "items": [{ "productId": "<id>", "qty": 2 }] }

  POST /api/track/view

{ "productId": "<id>", "sessionId": "abc" }

Returns: { ok: true } (or { ok: true, throttled: true })

GET /api/health → { ok, db, app, version, env, time }

GET /api/sim/state → { status, tick }


- **Modules split by responsibility:**
  - `db.js` (connection), `collections.js` (repo accessors), `schema.js` (indexes)
  - `pricing.js` (domain logic), `demand.js` (signals), `history.js` (trimming)
  - routers per concern: `products`, `commerce`, `tracking`, `sim`
  - `sim.js` (engine)
- **Single Responsibility**: each module does one thing.
- **Open/Closed**: you can tweak pricing or demand without touching routes.
- **Dependency Inversion**: routes depend on collection accessors, not raw clients.
- **Docs**: README + `.env.example` + scripts; clear run/seed steps.
- **Git**: multiple feature branches and commits per feature (you’ve been doing this 👍).


 **Health**  
   `GET /api/health` → `{ ok: true, db: true, ... }`

2. **Products**  
   `GET /api/products` → 4 coins with prices & stock

3. **History**  
   `GET /api/products/:id/history?limit=40` → array; after a minute of sim, should be **real** points

4. **Views**  
   Scroll the page (or Postman):  
   `POST /api/track/view` → `{ ok: true }` (throttled on rapid repeats)

5. **Checkout**  
   `POST /api/checkout` with a valid `_id` → stock decrements, order written

6. **Simulation**  
   Watch server logs:  
   `[sim] started @ 5000ms` and periodic `tick … · updated 4 products`  
   Prices change in `/api/products` or on the frontend (polling every ~8s)

7. **Trimming**  
   `pricePoints` per product shouldn’t grow without bound; caps around your `keep` threshold.

```md

```


### References & Tools Used
- [MongoDB Documentation](https://www.mongodb.com/docs/) — database setup, queries, schema design  
- [Chart.js](https://www.chartjs.org/docs/latest/) — interactive price history charts  
- [Express.js Documentation](https://expressjs.com/) — API routing and middleware  
- [Node.js Documentation](https://nodejs.org/docs/) — server runtime  
- [ChatGPT](https://chatgpt.com/share/68a21501-2e10-8005-a0b2-c069266fb2e5) — code snippets, debugging assistance, and architectural guidance (one of different chats)
- YouTube tutorials (for general learning and project setup inspiration)


## Web App Preview

Here are some screenshots of the application in action:

<img width="861" height="112" alt="npm run dev" src="https://github.com/user-attachments/assets/77783e7c-10e2-4e53-95e7-1a6fcf129400" />

<img width="1891" height="897" alt="app 1" src="https://github.com/user-attachments/assets/407bb4ad-d538-4a76-a073-8fab4116a201" />

<img width="440" height="263" alt="app 2" src="https://github.com/user-attachments/assets/281cc290-01cc-4336-aca9-fc17ec5a05e0" />

<img width="921" height="497" alt="app 3" src="https://github.com/user-attachments/assets/a9be2ea5-fc5b-4ca0-828e-dd8ab9600989" />

<img width="1662" height="448" alt="app 4" src="https://github.com/user-attachments/assets/d0741cbb-2e51-45b5-b799-45cb5a8cf175" />






