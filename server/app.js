import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import { PORT, NODE_ENV, APP_NAME, APP_VERSION } from "./config.js";
import { connectDB, getDB, closeDB } from "./db.js";
import productsRouter from "./routes/products.js";
import { initSimulation, startSimulation, getSimState, tickOnce, pauseSimulation } from "./sim.js";
import commerceRouter from "./routes/commerce.js";
import trackingRouter from "./routes/tracking.js";




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middleware
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(compression());
app.use(express.json());
app.use(cors());

// Mount your API routes here vv
app.use("/api", productsRouter);
app.use("/api", commerceRouter);
app.use("/api", trackingRouter);



app.get("/api/sim/state", (req, res) => {
  res.json(getSimState());
});


// health route (reports DB status)
app.get("/api/health", async (req, res) => {
  let dbOk = false;
  try {
    const db = getDB();
    await db.command({ ping: 1 });
    dbOk = true;
  } catch (_) {}
  res.json({
    ok: true,
    db: dbOk,
    app: APP_NAME,
    version: APP_VERSION,
    env: NODE_ENV,
    time: new Date().toISOString(),
  });
});

// serve frontend (optional)
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index.html")));

async function start() {
  try {
    await connectDB();
    app.locals.db = getDB();

    await initSimulation();
    startSimulation(); // auto-start background loop

    app.listen(PORT, () => {
      console.log(`[${APP_NAME}] listening on http://localhost:${PORT} (${NODE_ENV})`);
    });
  } catch (err) {
    console.error("Failed to start server (DB connection error):", err.message);
    process.exit(1);
  }
}

// graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await closeDB();
  process.exit(0);
});

start();

