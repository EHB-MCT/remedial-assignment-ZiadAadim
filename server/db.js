import { MongoClient, ServerApiVersion } from "mongodb";
import { MONGODB_URI, MONGODB_DBNAME } from "./config.js";

let client;
let db;

/**
 * Connects to MongoDB Atlas (or any MongoDB) once and reuses the connection.
 * Exposes getDB() for other modules.
 */
export async function connectDB() {
  if (db) return db;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI missing. Add it to your .env file.");
  }

  client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(MONGODB_DBNAME);

  // quick ping to verify connection
  await db.command({ ping: 1 });
  console.log(`[db] Connected to ${MONGODB_DBNAME}`);

  return db;
}

export function getDB() {
  if (!db) throw new Error("DB not connected yet. Call connectDB() first.");
  return db;
}

export async function closeDB() {
  try {
    await client?.close();
  } finally {
    client = undefined;
    db = undefined;
  }
}
