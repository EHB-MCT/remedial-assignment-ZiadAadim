import dotenv from "dotenv";
dotenv.config(); // load .env before reading values

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const APP_NAME = "crypto-shop-sim";
export const APP_VERSION = "0.0.1";


// MongoDB Atlas
export const MONGODB_URI = process.env.MONGODB_URI || "";
export const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "crypto_shop";

// Simulation
export const SIM_INTERVAL_MS = Number(process.env.SIM_INTERVAL_MS || 5000); // every 5s