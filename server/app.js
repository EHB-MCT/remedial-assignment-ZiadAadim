import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import { PORT, NODE_ENV, APP_NAME, APP_VERSION } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(compression());
app.use(express.json());
app.use(cors()); // if you serve frontend from same origin it's fine; this helps during local tests

// --- API routes
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: APP_NAME,
    version: APP_VERSION,
    env: NODE_ENV,
    time: new Date().toISOString()
  });
});

// (placeholder: more routes come in later branches)

// --- Static frontend (optional: serves /public if you want one server)
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Fallback to index.html for root (keeps it simple during dev)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// --- Start
app.listen(PORT, () => {
  console.log(`[${APP_NAME}] listening on http://localhost:${PORT} (${NODE_ENV})`);
});
